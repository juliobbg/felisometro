// ESTE ES TU NUEVO HomeScreen.js
// Reemplaza todo el contenido de tu archivo HomeScreen.js actual con este código

import { BarChart3, Plus, Save, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Importar los servicios y componentes nuevos
import GraficoEvolucion from '../components/GraficoEvolucion';
import TarjetaRachas from '../components/TarjetaRachas';
import StorageService from '../services/storage';

export default function HomeScreen() {
  // Categorías por defecto
  const categoriasDefault = [
    { id: '1', nombre: 'Comida', puntuacion: 5 },
    { id: '2', nombre: 'Deporte', puntuacion: 5 },
    { id: '3', nombre: 'Familia', puntuacion: 5 },
    { id: '4', nombre: 'Amistad', puntuacion: 5 },
    { id: '5', nombre: 'Ocio', puntuacion: 5 },
    { id: '6', nombre: 'Trabajo', puntuacion: 5 },
  ];

  // Estados
  const [categorias, setCategorias] = useState(categoriasDefault);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [historial, setHistorial] = useState([]);
  const [rachas, setRachas] = useState({ actual: 0, mejor: 0 });
  const [registroGuardadoHoy, setRegistroGuardadoHoy] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Auto-guardar categorías cuando cambian
  useEffect(() => {
    if (!cargando) {
      const timer = setTimeout(() => {
        StorageService.guardarCategorias(categorias);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [categorias, cargando]);

  // Función para cargar todos los datos
  const cargarDatos = async () => {
    try {
      setCargando(true);

      // Cargar categorías guardadas
      const categoriasGuardadas = await StorageService.cargarCategorias();
      if (categoriasGuardadas) {
        setCategorias(categoriasGuardadas);
      }

      // Cargar historial
      const historialCargado = await StorageService.cargarHistorial();
      setHistorial(historialCargado);

      // Cargar rachas
      const rachasCargadas = await StorageService.obtenerRachas();
      setRachas(rachasCargadas);

      // Verificar si ya hay registro hoy
      const registroHoy = await StorageService.obtenerRegistroHoy();
      setRegistroGuardadoHoy(!!registroHoy);

      setCargando(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setCargando(false);
    }
  };

  // Calcular la media de todas las categorías
  const calcularMedia = () => {
    if (categorias.length === 0) return 0;
    const suma = categorias.reduce((acc, cat) => acc + cat.puntuacion, 0);
    return (suma / categorias.length).toFixed(1);
  };

  // Obtener emoji según puntuación
  const obtenerEmoji = (puntuacion) => {
    if (puntuacion >= 9) return '😄';
    if (puntuacion >= 7) return '😊';
    if (puntuacion >= 5) return '🙂';
    if (puntuacion >= 3) return '😐';
    return '😔';
  };

  // Obtener mensaje según puntuación
  const obtenerMensaje = (puntuacion) => {
    if (puntuacion >= 9) return '¡Increíble! Estás genial';
    if (puntuacion >= 7) return '¡Excelente! Te va muy bien';
    if (puntuacion >= 5) return 'Bien, pero puedes mejorar';
    if (puntuacion >= 3) return 'Necesitas mejorar tu bienestar';
    return 'Cuida tu bienestar';
  };

  // Actualizar puntuación de una categoría
  const actualizarPuntuacion = (id, nuevaPuntuacion) => {
    setCategorias(categorias.map(cat =>
      cat.id === id ? { ...cat, puntuacion: nuevaPuntuacion } : cat
    ));
    setRegistroGuardadoHoy(false);
  };

  // Eliminar categoría
  const eliminarCategoria = (id) => {
    Alert.alert(
      'Eliminar categoría',
      '¿Estás seguro de que quieres eliminar esta categoría?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setCategorias(categorias.filter(cat => cat.id !== id));
            setRegistroGuardadoHoy(false);
          }
        }
      ]
    );
  };

  // Agregar nueva categoría
  const agregarCategoria = () => {
    if (nuevaCategoria.trim() === '') {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return;
    }

    const nueva = {
      id: Date.now().toString(),
      nombre: nuevaCategoria,
      puntuacion: 5
    };

    setCategorias([...categorias, nueva]);
    setNuevaCategoria('');
    setModalVisible(false);
    setRegistroGuardadoHoy(false);
  };

  // Guardar registro del día
  const guardarRegistroDiario = async () => {
    try {
      const media = parseFloat(calcularMedia());
      
      const registro = {
        categorias: categorias,
        mediaDelDia: media,
        notas: '',
      };

      const exito = await StorageService.guardarRegistroDiario(registro);
      
      if (exito) {
        setRegistroGuardadoHoy(true);
        
        // Recargar datos
        const historialActualizado = await StorageService.cargarHistorial();
        setHistorial(historialActualizado);
        
        const rachasActualizadas = await StorageService.obtenerRachas();
        setRachas(rachasActualizadas);

        Alert.alert(
          '✅ ¡Guardado!',
          `Tu registro de hoy (${media}/10) ha sido guardado exitosamente.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo guardar el registro');
      }
    } catch (error) {
      console.error('Error guardando registro:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar');
    }
  };

  const media = parseFloat(calcularMedia());
  const colorMedia = media >= 7 ? '#10b981' : media >= 5 ? '#f59e0b' : '#ef4444';

  // Pantalla de carga
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={{ marginTop: 16, color: '#6b7280' }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#8b5cf6', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
              Tu Felicidad
            </Text>
            <Text style={{ fontSize: 16, color: '#e9d5ff' }}>
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => setMostrarHistorial(!mostrarHistorial)}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: 12, 
              borderRadius: 12,
            }}
          >
            <BarChart3 size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Medidor de felicidad */}
        <View style={{ 
          backgroundColor: 'white', 
          marginHorizontal: 20, 
          marginTop: -20, 
          borderRadius: 16, 
          padding: 24, 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 2 }, 
          shadowOpacity: 0.1, 
          shadowRadius: 8, 
          elevation: 4 
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 100, marginBottom: 12 }}>
              {obtenerEmoji(media)}
            </Text>
            
            <View style={{ 
              backgroundColor: colorMedia, 
              paddingHorizontal: 16, 
              paddingVertical: 8, 
              borderRadius: 20,
              marginBottom: 8
            }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
                {media}
              </Text>
            </View>

            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
              Nivel de Felicidad
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
              {obtenerMensaje(media)}
            </Text>

            {/* Botón guardar */}
            <TouchableOpacity
              onPress={guardarRegistroDiario}
              disabled={registroGuardadoHoy}
              style={{ 
                backgroundColor: registroGuardadoHoy ? '#10b981' : '#8b5cf6',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                opacity: registroGuardadoHoy ? 0.7 : 1,
              }}
            >
              {registroGuardadoHoy ? (
                <>
                  <Text style={{ fontSize: 20 }}>✓</Text>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    Guardado hoy
                  </Text>
                </>
              ) : (
                <>
                  <Save size={20} color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    Guardar registro de hoy
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {historial.length > 0 && (
              <Text style={{ 
                fontSize: 12, 
                color: '#6b7280', 
                marginTop: 8,
                textAlign: 'center',
              }}>
                {registroGuardadoHoy 
                  ? 'Ya registraste tu felicidad hoy' 
                  : 'Guarda tu registro para mantener tu racha'}
              </Text>
            )}
          </View>
        </View>

        {/* Historial y Rachas (condicional) */}
        {mostrarHistorial && historial.length > 0 && (
          <>
            <TarjetaRachas 
              rachaActual={rachas.actual} 
              mejorRacha={rachas.mejor}
            />
            
            <GraficoEvolucion datos={historial} />
          </>
        )}

        {/* Lista de categorías */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
              Categorías
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{ 
                backgroundColor: '#8b5cf6', 
                paddingHorizontal: 16, 
                paddingVertical: 8, 
                borderRadius: 8, 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 6 
              }}
            >
              <Plus size={16} color="white" />
              <Text style={{ color: 'white', fontWeight: '600' }}>Añadir</Text>
            </TouchableOpacity>
          </View>

          {categorias.map((categoria) => (
            <View key={categoria.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 12, 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 1 }, 
              shadowOpacity: 0.05, 
              shadowRadius: 4, 
              elevation: 2 
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 24 }}>
                    {obtenerEmoji(categoria.puntuacion)}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                    {categoria.nombre}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#8b5cf6' }}>
                    {categoria.puntuacion}
                  </Text>
                  <TouchableOpacity onPress={() => eliminarCategoria(categoria.id)}>
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Slider */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => actualizarPuntuacion(categoria.id, num)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: categoria.puntuacion >= num ? '#8b5cf6' : '#e5e7eb',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ 
                      fontSize: 10, 
                      fontWeight: 'bold', 
                      color: categoria.puntuacion >= num ? 'white' : '#9ca3af' 
                    }}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Modal para añadir categoría */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '85%', maxWidth: 400 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
              Nueva Categoría
            </Text>

            <TextInput
              style={{ 
                borderWidth: 1, 
                borderColor: '#d1d5db', 
                borderRadius: 8, 
                padding: 12, 
                fontSize: 16, 
                marginBottom: 20 
              }}
              placeholder="Nombre de la categoría"
              value={nuevaCategoria}
              onChangeText={setNuevaCategoria}
              autoFocus
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setNuevaCategoria('');
                }}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#e5e7eb', 
                  padding: 14, 
                  borderRadius: 8, 
                  alignItems: 'center' 
                }}
              >
                <Text style={{ fontWeight: '600', color: '#374151' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={agregarCategoria}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#8b5cf6', 
                  padding: 14, 
                  borderRadius: 8, 
                  alignItems: 'center' 
                }}
              >
                <Text style={{ fontWeight: '600', color: 'white' }}>Añadir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
