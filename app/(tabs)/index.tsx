import { Plus, Trash2, MessageCircle, BarChart3, BookOpen, Moon, Sun } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import StorageService from '../../services/storage';
import GraficoEvolucion from '../../components/GraficoEvolucion';
import TarjetaRachas from '../../components/TarjetaRachas';
import TarjetaInsights from '../../components/TarjetaInsights';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { getCategorySuggestions } from '../../utils/categorySuggestions';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, cambiarTema, colors } = useTheme();
  const { userData, getAge } = useUser();

  // Categorías por defecto
  const categoriasDefault = [
    { id: '1', nombre: 'Comida', puntuacion: 5, importancia: 50 },
    { id: '2', nombre: 'Deporte', puntuacion: 5, importancia: 50 },
    { id: '3', nombre: 'Familia', puntuacion: 5, importancia: 50 },
    { id: '4', nombre: 'Amistad', puntuacion: 5, importancia: 50 },
    { id: '5', nombre: 'Ocio', puntuacion: 5, importancia: 50 },
    { id: '6', nombre: 'Trabajo', puntuacion: 5, importancia: 50 },
  ];

  // Estados
  const [categorias, setCategorias] = useState(categoriasDefault);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [importanciaNuevaCategoria, setImportanciaNuevaCategoria] = useState(50);
  const [sugerencias, setSugerencias] = useState<Array<{name: string, icon: string}>>([]);
  const [historial, setHistorial] = useState([]);
  const [rachas, setRachas] = useState({ actual: 0, mejor: 0 });
  const [cargando, setCargando] = useState(true);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [notasDiarias, setNotasDiarias] = useState('');
  const [modalNotasVisible, setModalNotasVisible] = useState(false);
  const [modalEditarImportancia, setModalEditarImportancia] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [importanciaEditando, setImportanciaEditando] = useState(50);
  const [vistaNotas, setVistaNotas] = useState('lista'); // 'lista' o 'editar'
  const [fechaNotaSeleccionada, setFechaNotaSeleccionada] = useState(null);
  const [notaSeleccionada, setNotaSeleccionada] = useState('');
  const [clicksEmoji, setClicksEmoji] = useState(0);
  const [clicksReset, setClicksReset] = useState(0);

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar sugerencias de categorías cuando se abre el modal
  useEffect(() => {
    if (modalVisible) {
      if (userData) {
        // Usuario con onboarding completado: sugerencias personalizadas
        const edad = getAge();
        const sugerenciasPersonalizadas = getCategorySuggestions(edad, userData.sex);
        setSugerencias(sugerenciasPersonalizadas);
      } else {
        // Usuario sin onboarding: sugerencias universales
        const sugerenciasUniversales = getCategorySuggestions(null, 'otro');
        setSugerencias(sugerenciasUniversales);
      }
    }
  }, [modalVisible, userData]);

  // Cargar notas del día actual
  useEffect(() => {
    const cargarNotasHoy = async () => {
      const registroHoy = await StorageService.obtenerRegistroHoy();
      if (registroHoy && registroHoy.notas) {
        setNotasDiarias(registroHoy.notas);
      }
    };
    if (!cargando) {
      cargarNotasHoy();
    }
  }, [cargando]);

  // Auto-guardar categorías y registro cuando cambian
  useEffect(() => {
    if (!cargando) {
      const timer = setTimeout(async () => {
        await StorageService.guardarCategorias(categorias);
        await guardarRegistroDiarioAutomatico();
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

      setCargando(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setCargando(false);
    }
  };

  // Calcular la media ponderada de todas las categorías según su importancia
  const calcularMedia = () => {
    if (categorias.length === 0) return 0;

    // Media ponderada: (suma de puntuacion * importancia) / (suma de importancias)
    const sumaPonderada = categorias.reduce((acc, cat) => {
      const importancia = cat.importancia || 50; // Si no tiene importancia, usar 50 por defecto
      return acc + (cat.puntuacion * importancia);
    }, 0);

    const sumaImportancias = categorias.reduce((acc, cat) => {
      return acc + (cat.importancia || 50);
    }, 0);

    return (sumaPonderada / sumaImportancias).toFixed(1);
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
  };

  // Abrir modal para editar importancia
  const abrirModalEditarImportancia = (categoria) => {
    setCategoriaEditando(categoria);
    setImportanciaEditando(categoria.importancia || 50);
    setModalEditarImportancia(true);
  };

  // Actualizar importancia de una categoría
  const actualizarImportancia = () => {
    if (categoriaEditando) {
      setCategorias(categorias.map(cat =>
        cat.id === categoriaEditando.id ? { ...cat, importancia: importanciaEditando } : cat
      ));
      setModalEditarImportancia(false);
      setCategoriaEditando(null);
    }
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
      puntuacion: 5,
      importancia: importanciaNuevaCategoria
    };

    setCategorias([...categorias, nueva]);
    setNuevaCategoria('');
    setImportanciaNuevaCategoria(50);
    setModalVisible(false);
  };

  // Guardar registro del día automáticamente (silencioso)
  const guardarRegistroDiarioAutomatico = async () => {
    try {
      const media = parseFloat(calcularMedia());

      const registro = {
        categorias: categorias,
        mediaDelDia: media,
        notas: notasDiarias,
      };

      const exito = await StorageService.guardarRegistroDiario(registro);

      if (exito) {
        // Recargar datos silenciosamente
        const historialActualizado = await StorageService.cargarHistorial();
        setHistorial(historialActualizado);

        const rachasActualizadas = await StorageService.obtenerRachas();
        setRachas(rachasActualizadas);
      }
    } catch (error) {
      console.error('Error guardando registro automático:', error);
    }
  };

  // Guardar notas
  const guardarNotas = async () => {
    await guardarRegistroDiarioAutomatico();
    setModalNotasVisible(false);
    Alert.alert('✓ Guardado', 'Tus notas han sido guardadas');
  };

  // Guardar nota editada (de cualquier fecha)
  const guardarNotaEditada = async () => {
    if (fechaNotaSeleccionada) {
      // Actualizar nota de fecha específica
      const historialActualizado = historial.map((r: any) => {
        if (r.fecha === fechaNotaSeleccionada) {
          return { ...r, notas: notaSeleccionada };
        }
        return r;
      });

      // Guardar en storage
      await StorageService.guardarHistorial(historialActualizado);
      setHistorial(historialActualizado);
      Alert.alert('✓ Guardado', 'Tu nota ha sido actualizada');
      setVistaNotas('lista');
    } else {
      // Guardar nota de hoy
      await guardarNotas();
      setVistaNotas('lista');
    }
  };

  // Ir a la pantalla del psicólogo
  const irAlPsicologo = () => {
    router.push('/psicologo');
  };

  // Abrir modal de notas mostrando lista de fechas
  const abrirModalNotas = () => {
    setVistaNotas('lista');
    setModalNotasVisible(true);
  };

  // Easter egg: detectar clics en el emoji
  const manejarClickEmoji = () => {
    const nuevoContador = clicksEmoji + 1;
    setClicksEmoji(nuevoContador);

    if (nuevoContador >= 5) {
      Alert.alert(
        '✨ Agradecimientos Especiales ✨',
        'Gracias a José Andrés Ruano por su apoyo y contribución al desarrollo de Felisómetro.\n\n¡Tu ayuda ha sido fundamental! 🙏',
        [
          {
            text: 'Cerrar',
            onPress: () => setClicksEmoji(0)
          }
        ]
      );
    }
  };

  // Abrir vista para añadir/editar nota del día actual
  const abrirEditorNota = async (fecha = null) => {
    if (fecha) {
      // Ver nota de una fecha específica
      const registro = historial.find((r: any) => r.fecha === fecha);
      if (registro && registro.notas) {
        setNotaSeleccionada(registro.notas);
        setFechaNotaSeleccionada(fecha);
      }
    } else {
      // Añadir/editar nota de hoy
      const registroHoy = await StorageService.obtenerRegistroHoy();
      if (registroHoy && registroHoy.notas) {
        setNotasDiarias(registroHoy.notas);
      }
      setFechaNotaSeleccionada(null);
    }
    setVistaNotas('editar');
  };

  const media = parseFloat(calcularMedia());
  const colorMedia = media >= 7 ? '#10b981' : media >= 5 ? '#f59e0b' : '#ef4444';

  // Pantalla de carga
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#7fb3b3', '#99cccc', '#b3d9d9'] : ['#6fb3b3', '#99cccc', '#cce6e6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              const nuevoContador = clicksReset + 1;
              setClicksReset(nuevoContador);
              if (nuevoContador >= 7) {
                Alert.alert(
                  '🔧 Modo Debug',
                  '¿Quieres resetear todos los datos de la app?',
                  [
                    { text: 'Cancelar', onPress: () => setClicksReset(0) },
                    { text: 'Ir a Reset', onPress: () => router.push('/reset' as any) }
                  ]
                );
              }
            }}
            activeOpacity={0.9}
          >
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
              Felizómetro
            </Text>
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)' }}>
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => cambiarTema(isDark ? 'light' : 'dark')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.25)',
                padding: 12,
                borderRadius: 12,
              }}
            >
              {isDark ? <Sun size={24} color="white" /> : <Moon size={24} color="white" />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMostrarHistorial(!mostrarHistorial)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.25)',
                padding: 12,
                borderRadius: 12,
              }}
            >
              <BarChart3 size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }}>
        {/* Medidor de felicidad */}
        <View style={{
          backgroundColor: colors.surface,
          marginHorizontal: 20,
          marginTop: -20,
          borderRadius: 16,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.cardBorder
        }}>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={manejarClickEmoji} activeOpacity={0.7}>
              <Text style={{ fontSize: 50, marginBottom: 12 }}>
                {obtenerEmoji(media)}
              </Text>
            </TouchableOpacity>
            
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

            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
              Nivel de Felicidad
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
              {obtenerMensaje(media)}
            </Text>

            {/* Botones de acción */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, width: '100%' }}>
              <TouchableOpacity
                onPress={irAlPsicologo}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <MessageCircle size={18} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                  Felizólogo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={abrirModalNotas}
                style={{
                  flex: 1,
                  backgroundColor: '#10b981',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <BookOpen size={18} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                  Mis Notas
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{
              fontSize: 12,
              color: colors.textSecondary,
              marginTop: 8,
              textAlign: 'center',
            }}>
              Tu registro se guarda automáticamente
            </Text>
          </View>
        </View>

        {/* Historial y Rachas (condicional) */}
        {mostrarHistorial && historial.length > 0 && (
          <>
            <TarjetaInsights />

            <TarjetaRachas
              rachaActual={rachas.actual}
              mejorRacha={rachas.mejor}
            />

            <GraficoEvolucion datos={historial} />
          </>
        )}

        {/* Lista de categorías */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                backgroundColor: colors.primary,
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
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 24 }}>
                    {obtenerEmoji(categoria.puntuacion)}
                  </Text>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      {categoria.nombre}
                    </Text>
                    <TouchableOpacity onPress={() => abrirModalEditarImportancia(categoria)}>
                      <Text style={{ fontSize: 12, color: colors.primary, marginTop: 2, textDecorationLine: 'underline' }}>
                        Importancia: {categoria.importancia || 50}%
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>
                    {categoria.puntuacion}
                  </Text>
                  <TouchableOpacity onPress={() => eliminarCategoria(categoria.id)}>
                    <Trash2 size={20} color={colors.error} />
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
                      backgroundColor: categoria.puntuacion >= num ? colors.primary : colors.inputBackground,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: isDark && categoria.puntuacion < num ? 1 : 0,
                      borderColor: colors.border
                    }}
                  >
                    <Text style={{
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: categoria.puntuacion >= num ? 'white' : colors.textTertiary
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.overlay }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            width: '85%',
            maxWidth: 400,
            maxHeight: '80%',
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
              Nueva Categoría
            </Text>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBackground,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 12,
                color: colors.text
              }}
              placeholder="Nombre de la categoría"
              placeholderTextColor={colors.placeholder}
              value={nuevaCategoria}
              onChangeText={setNuevaCategoria}
              autoFocus
            />

            {/* Sugerencias personalizadas */}
            {sugerencias.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>
                  Sugerencias para ti:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -4 }}
                >
                  {sugerencias.slice(0, 10).map((sugerencia, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setNuevaCategoria(sugerencia.name)}
                      style={{
                        backgroundColor: colors.inputBackground,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                        marginHorizontal: 4,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        borderWidth: nuevaCategoria === sugerencia.name ? 2 : 1,
                        borderColor: nuevaCategoria === sugerencia.name ? colors.primary : colors.inputBorder
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{sugerencia.icon}</Text>
                      <Text style={{
                        fontSize: 14,
                        color: nuevaCategoria === sugerencia.name ? colors.primary : colors.text,
                        fontWeight: nuevaCategoria === sugerencia.name ? '600' : '400'
                      }}>
                        {sugerencia.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Slider de importancia */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  Importancia en tu vida
                </Text>
                <View style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12
                }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
                    {importanciaNuevaCategoria}%
                  </Text>
                </View>
              </View>

              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={100}
                step={1}
                value={importanciaNuevaCategoria}
                onValueChange={setImportanciaNuevaCategoria}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.inputBorder}
                thumbTintColor={colors.primary}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Menos importante</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Muy importante</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setNuevaCategoria('');
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.inputBackground,
                  padding: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Text style={{ fontWeight: '600', color: colors.text }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={agregarCategoria}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
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

      {/* Modal para notas - Vista de Lista o Editor */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalNotasVisible}
        onRequestClose={() => {
          setModalNotasVisible(false);
          setVistaNotas('lista');
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.overlay }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            width: '90%',
            maxWidth: 500,
            maxHeight: '80%',
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border
          }}>
            {vistaNotas === 'lista' ? (
              // Vista de lista de notas
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <BookOpen size={24} color={colors.success} />
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginLeft: 12 }}>
                      Mis Notas
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalNotasVisible(false)}>
                    <Text style={{ fontSize: 24, color: colors.textSecondary }}>×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 400 }}>
                  {historial.filter((r: any) => r.notas && r.notas.trim() !== '').length === 0 ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
                        No tienes notas guardadas aún
                      </Text>
                    </View>
                  ) : (
                    historial
                      .filter((r: any) => r.notas && r.notas.trim() !== '')
                      .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                      .map((registro: any, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => abrirEditorNota(registro.fecha)}
                          style={{
                            backgroundColor: colors.inputBackground,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 12,
                            borderWidth: isDark ? 1 : 0,
                            borderColor: colors.border
                          }}
                        >
                          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
                            {new Date(registro.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </Text>
                          <Text
                            style={{ fontSize: 14, color: colors.textSecondary }}
                            numberOfLines={2}
                          >
                            {registro.notas}
                          </Text>
                        </TouchableOpacity>
                      ))
                  )}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => abrirEditorNota()}
                  style={{
                    backgroundColor: colors.success,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginTop: 16,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Plus size={20} color="white" />
                  <Text style={{ fontWeight: '600', color: 'white', fontSize: 16 }}>
                    Añadir Nota de Hoy
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // Vista de editor de nota
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <TouchableOpacity
                    onPress={() => setVistaNotas('lista')}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 24, color: colors.primary, marginRight: 8 }}>←</Text>
                    <BookOpen size={24} color={colors.success} />
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginLeft: 12 }}>
                      {fechaNotaSeleccionada ? 'Ver Nota' : 'Añadir Nota'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {fechaNotaSeleccionada && (
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
                    {new Date(fechaNotaSeleccionada).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </Text>
                )}

                {!fechaNotaSeleccionada && (
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
                    ¿Cómo te sientes hoy? Escribe lo que quieras recordar...
                  </Text>
                )}

                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.inputBackground,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    height: 300,
                    textAlignVertical: 'top',
                    color: colors.text
                  }}
                  placeholder="Hoy fue un buen día porque..."
                  placeholderTextColor={colors.placeholder}
                  value={fechaNotaSeleccionada ? notaSeleccionada : notasDiarias}
                  onChangeText={fechaNotaSeleccionada ? setNotaSeleccionada : setNotasDiarias}
                  multiline
                  numberOfLines={10}
                  autoFocus={!fechaNotaSeleccionada}
                />

                <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 8 }}>
                  {fechaNotaSeleccionada ? notaSeleccionada.length : notasDiarias.length} caracteres
                </Text>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                  <TouchableOpacity
                    onPress={() => setVistaNotas('lista')}
                    style={{
                      flex: 1,
                      backgroundColor: colors.inputBackground,
                      padding: 14,
                      borderRadius: 8,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.border
                    }}
                  >
                    <Text style={{ fontWeight: '600', color: colors.text }}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={guardarNotaEditada}
                    style={{
                      flex: 1,
                      backgroundColor: colors.success,
                      padding: 14,
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ fontWeight: '600', color: 'white' }}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para editar importancia de categoría */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalEditarImportancia}
        onRequestClose={() => setModalEditarImportancia(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.overlay }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            width: '85%',
            maxWidth: 400,
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>
              Editar Importancia
            </Text>

            {categoriaEditando && (
              <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 24 }}>
                {categoriaEditando.nombre}
              </Text>
            )}

            {/* Slider de importancia */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  Importancia en tu vida
                </Text>
                <View style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12
                }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
                    {importanciaEditando}%
                  </Text>
                </View>
              </View>

              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={100}
                step={1}
                value={importanciaEditando}
                onValueChange={setImportanciaEditando}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.inputBorder}
                thumbTintColor={colors.primary}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Menos importante</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Muy importante</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setModalEditarImportancia(false);
                  setCategoriaEditando(null);
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.inputBackground,
                  padding: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Text style={{ fontWeight: '600', color: colors.text }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={actualizarImportancia}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  padding: 14,
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontWeight: '600', color: 'white' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
