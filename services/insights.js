import StorageService from './storage';

class InsightsService {
  // Analizar patrones de felicidad por día de la semana
  async analizarPorDiaSemana() {
    try {
      const historial = await StorageService.cargarHistorial();
      if (historial.length < 7) return null;

      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const promediosPorDia = {};

      // Inicializar
      diasSemana.forEach(dia => {
        promediosPorDia[dia] = { total: 0, count: 0 };
      });

      // Calcular promedios
      historial.forEach(registro => {
        const fecha = new Date(registro.fecha);
        const dia = diasSemana[fecha.getDay()];
        promediosPorDia[dia].total += registro.mediaDelDia;
        promediosPorDia[dia].count += 1;
      });

      // Calcular promedios finales
      const resultados = Object.entries(promediosPorDia).map(([dia, data]) => ({
        dia,
        promedio: data.count > 0 ? (data.total / data.count).toFixed(1) : 0,
        registros: data.count
      }));

      // Encontrar mejor y peor día
      const mejorDia = resultados.reduce((max, current) =>
        parseFloat(current.promedio) > parseFloat(max.promedio) ? current : max
      );
      const peorDia = resultados.reduce((min, current) =>
        parseFloat(current.promedio) < parseFloat(min.promedio) && current.registros > 0 ? current : min
      );

      return {
        porDia: resultados,
        mejorDia,
        peorDia,
        insight: `Tu día más feliz suele ser el ${mejorDia.dia} (${mejorDia.promedio}/10). ${
          peorDia.promedio < 6 ? `Los ${peorDia.dia}s suelen ser más difíciles (${peorDia.promedio}/10).` : ''
        }`
      };
    } catch (error) {
      console.error('Error analizando por día:', error);
      return null;
    }
  }

  // Analizar correlaciones entre categorías
  async analizarCorrelacionCategorias() {
    try {
      const historial = await StorageService.cargarHistorial();
      if (historial.length < 5) return null;

      const correlaciones = [];
      const ultimosRegistros = historial.slice(0, 10);

      // Analizar qué categoría baja correlaciona con felicidad general baja
      const todasCategorias = new Set();
      ultimosRegistros.forEach(r => {
        r.categorias?.forEach(cat => todasCategorias.add(cat.nombre));
      });

      todasCategorias.forEach(nombreCat => {
        let sumaDiferencias = 0;
        let count = 0;

        ultimosRegistros.forEach(registro => {
          const categoria = registro.categorias?.find(c => c.nombre === nombreCat);
          if (categoria) {
            const diferencia = Math.abs(categoria.puntuacion - registro.mediaDelDia);
            sumaDiferencias += diferencia;
            count++;
          }
        });

        if (count > 0) {
          const correlacion = sumaDiferencias / count;
          correlaciones.push({
            categoria: nombreCat,
            impacto: correlacion < 1.5 ? 'alto' : correlacion < 3 ? 'medio' : 'bajo',
            valor: correlacion
          });
        }
      });

      // Ordenar por impacto
      correlaciones.sort((a, b) => a.valor - b.valor);
      const mayorImpacto = correlaciones[0];

      return {
        correlaciones,
        mayorImpacto,
        insight: mayorImpacto
          ? `${mayorImpacto.categoria} parece tener un gran impacto en tu felicidad general. Cuando ${mayorImpacto.categoria} está bien, tú estás bien.`
          : null
      };
    } catch (error) {
      console.error('Error analizando correlaciones:', error);
      return null;
    }
  }

  // Detectar tendencias
  async detectarTendencias() {
    try {
      const historial = await StorageService.cargarHistorial();
      if (historial.length < 14) return null;

      const ultimos7 = historial.slice(0, 7);
      const anteriores7 = historial.slice(7, 14);

      const mediaReciente = ultimos7.reduce((sum, r) => sum + r.mediaDelDia, 0) / 7;
      const mediaAnterior = anteriores7.reduce((sum, r) => sum + r.mediaDelDia, 0) / 7;

      const diferencia = mediaReciente - mediaAnterior;
      const porcentaje = ((diferencia / mediaAnterior) * 100).toFixed(1);

      let tendencia = 'estable';
      let mensaje = 'Tu felicidad se mantiene estable.';

      if (diferencia > 0.8) {
        tendencia = 'mejorando';
        mensaje = `¡Vas por buen camino! Tu felicidad ha mejorado un ${Math.abs(porcentaje)}% esta semana.`;
      } else if (diferencia < -0.8) {
        tendencia = 'empeorando';
        mensaje = `Has tenido una semana difícil. Tu felicidad bajó un ${Math.abs(porcentaje)}%. Recuerda que es temporal.`;
      }

      return {
        tendencia,
        mediaReciente: mediaReciente.toFixed(1),
        mediaAnterior: mediaAnterior.toFixed(1),
        diferencia: diferencia.toFixed(1),
        porcentaje,
        insight: mensaje
      };
    } catch (error) {
      console.error('Error detectando tendencias:', error);
      return null;
    }
  }

  // Categorías que necesitan atención
  async categoriasQueNecesitanAtencion() {
    try {
      const historial = await StorageService.cargarHistorial();
      if (historial.length === 0) return null;

      const ultimoRegistro = historial[0];
      const categoriasOrdenadas = [...(ultimoRegistro.categorias || [])].sort((a, b) => a.puntuacion - b.puntuacion);

      const masBajas = categoriasOrdenadas.filter(c => c.puntuacion < 6);

      if (masBajas.length === 0) {
        return {
          categorias: [],
          insight: '¡Todas tus categorías están bien! Sigue así.'
        };
      }

      return {
        categorias: masBajas,
        insight: `${masBajas.map(c => c.nombre).join(', ')} ${masBajas.length === 1 ? 'necesita' : 'necesitan'} un poco más de atención.`
      };
    } catch (error) {
      console.error('Error analizando categorías:', error);
      return null;
    }
  }

  // Generar todos los insights
  async generarTodosInsights() {
    const [diaSemana, correlaciones, tendencias, categorias] = await Promise.all([
      this.analizarPorDiaSemana(),
      this.analizarCorrelacionCategorias(),
      this.detectarTendencias(),
      this.categoriasQueNecesitanAtencion()
    ]);

    const insights = [];

    if (tendencias?.insight) insights.push({ tipo: 'tendencia', mensaje: tendencias.insight, icono: '📈', color: '#3b82f6' });
    if (diaSemana?.insight) insights.push({ tipo: 'dia_semana', mensaje: diaSemana.insight, icono: '📅', color: '#99cccc' });
    if (correlaciones?.insight) insights.push({ tipo: 'correlacion', mensaje: correlaciones.insight, icono: '🔗', color: '#10b981' });
    if (categorias?.insight) insights.push({ tipo: 'categorias', mensaje: categorias.insight, icono: '⚠️', color: '#f59e0b' });

    return insights;
  }
}

export default new InsightsService();
