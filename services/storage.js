import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  CATEGORIAS: '@felisometro_categorias',
  HISTORIAL: '@felisometro_historial',
  CONFIGURACION: '@felisometro_config',
  RACHAS: '@felisometro_rachas',
};

class StorageService {
  // Guardar categorías
  async guardarCategorias(categorias) {
    try {
      await AsyncStorage.setItem(KEYS.CATEGORIAS, JSON.stringify(categorias));
      return true;
    } catch (error) {
      console.error('Error guardando categorías:', error);
      return false;
    }
  }

  // Cargar categorías
  async cargarCategorias() {
    try {
      const data = await AsyncStorage.getItem(KEYS.CATEGORIAS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error cargando categorías:', error);
      return null;
    }
  }

  // Guardar registro diario
  async guardarRegistroDiario(registro) {
    try {
      const historial = await this.cargarHistorial() || [];
      const hoy = new Date().toISOString().split('T')[0];
      
      // Buscar si ya existe un registro hoy
      const indiceHoy = historial.findIndex(r => r.fecha === hoy);
      
      const nuevoRegistro = {
        fecha: hoy,
        timestamp: Date.now(),
        categorias: registro.categorias,
        mediaDelDia: registro.mediaDelDia,
        notas: registro.notas || '',
      };

      if (indiceHoy >= 0) {
        // Actualizar registro existente
        historial[indiceHoy] = nuevoRegistro;
      } else {
        // Añadir nuevo registro
        historial.unshift(nuevoRegistro);
      }

      // Mantener solo últimos 365 días
      const historialLimitado = historial.slice(0, 365);
      
      await AsyncStorage.setItem(KEYS.HISTORIAL, JSON.stringify(historialLimitado));
      
      // Actualizar rachas
      await this.actualizarRachas();
      
      return true;
    } catch (error) {
      console.error('Error guardando registro:', error);
      return false;
    }
  }

  // Cargar historial completo
  async cargarHistorial() {
    try {
      const data = await AsyncStorage.getItem(KEYS.HISTORIAL);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error cargando historial:', error);
      return [];
    }
  }

  // Guardar historial completo (para editar notas antiguas)
  async guardarHistorial(historial) {
    try {
      await AsyncStorage.setItem(KEYS.HISTORIAL, JSON.stringify(historial));
      return true;
    } catch (error) {
      console.error('Error guardando historial:', error);
      return false;
    }
  }

  // Obtener registro de hoy
  async obtenerRegistroHoy() {
    try {
      const historial = await this.cargarHistorial();
      const hoy = new Date().toISOString().split('T')[0];
      return historial.find(r => r.fecha === hoy) || null;
    } catch (error) {
      console.error('Error obteniendo registro de hoy:', error);
      return null;
    }
  }

  // Obtener últimos N días
  async obtenerUltimosDias(dias = 7) {
    try {
      const historial = await this.cargarHistorial();
      return historial.slice(0, dias);
    } catch (error) {
      console.error('Error obteniendo últimos días:', error);
      return [];
    }
  }

  // Sistema de rachas
  async actualizarRachas() {
    try {
      const historial = await this.cargarHistorial();
      if (historial.length === 0) return;

      let rachaActual = 0;
      let mejorRacha = 0;
      let fechaActual = new Date();

      // Calcular racha actual
      for (let i = 0; i < historial.length; i++) {
        const fechaRegistro = new Date(historial[i].fecha);
        const diferenciaDias = Math.floor((fechaActual - fechaRegistro) / (1000 * 60 * 60 * 24));

        if (diferenciaDias === i) {
          rachaActual++;
        } else {
          break;
        }
      }

      // Calcular mejor racha histórica
      let rachaTemp = 1;
      for (let i = 1; i < historial.length; i++) {
        const fechaAnterior = new Date(historial[i - 1].fecha);
        const fechaActualLoop = new Date(historial[i].fecha);
        const diferencia = Math.floor((fechaAnterior - fechaActualLoop) / (1000 * 60 * 60 * 24));

        if (diferencia === 1) {
          rachaTemp++;
          mejorRacha = Math.max(mejorRacha, rachaTemp);
        } else {
          rachaTemp = 1;
        }
      }

      const rachas = {
        actual: rachaActual,
        mejor: Math.max(mejorRacha, rachaActual),
        ultimaActualizacion: Date.now(),
      };

      await AsyncStorage.setItem(KEYS.RACHAS, JSON.stringify(rachas));
      return rachas;
    } catch (error) {
      console.error('Error actualizando rachas:', error);
      return { actual: 0, mejor: 0 };
    }
  }

  // Obtener rachas
  async obtenerRachas() {
    try {
      const data = await AsyncStorage.getItem(KEYS.RACHAS);
      return data ? JSON.parse(data) : { actual: 0, mejor: 0 };
    } catch (error) {
      console.error('Error obteniendo rachas:', error);
      return { actual: 0, mejor: 0 };
    }
  }

  // Obtener estadísticas generales
  async obtenerEstadisticas() {
    try {
      const historial = await this.cargarHistorial();
      if (historial.length === 0) {
        return {
          totalRegistros: 0,
          mediaGeneral: 0,
          mejorDia: null,
          peorDia: null,
          tendencia: 'neutral',
        };
      }

      const mediaGeneral = historial.reduce((sum, r) => sum + r.mediaDelDia, 0) / historial.length;
      const ordenado = [...historial].sort((a, b) => b.mediaDelDia - a.mediaDelDia);
      
      // Calcular tendencia (últimos 7 días vs anteriores 7 días)
      let tendencia = 'neutral';
      if (historial.length >= 14) {
        const ultimos7 = historial.slice(0, 7).reduce((sum, r) => sum + r.mediaDelDia, 0) / 7;
        const anteriores7 = historial.slice(7, 14).reduce((sum, r) => sum + r.mediaDelDia, 0) / 7;
        
        if (ultimos7 > anteriores7 + 0.5) tendencia = 'mejorando';
        else if (ultimos7 < anteriores7 - 0.5) tendencia = 'empeorando';
      }

      return {
        totalRegistros: historial.length,
        mediaGeneral: parseFloat(mediaGeneral.toFixed(1)),
        mejorDia: ordenado[0],
        peorDia: ordenado[ordenado.length - 1],
        tendencia,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  // Limpiar todos los datos (para testing o reset)
  async limpiarTodo() {
    try {
      await AsyncStorage.multiRemove([
        KEYS.CATEGORIAS,
        KEYS.HISTORIAL,
        KEYS.CONFIGURACION,
        KEYS.RACHAS,
      ]);
      return true;
    } catch (error) {
      console.error('Error limpiando datos:', error);
      return false;
    }
  }
}

export default new StorageService();
