import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpsCallable } from 'firebase/functions';
import { AlertCircle, Crown, MessageCircle, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { functions } from '../firebase.config';
import StorageService from '../services/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function FelizologoScreen() {
  const { colors, isDark } = useTheme();
  const [mensajes, setMensajes] = useState([]);
  const [textoInput, setTextoInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajesRestantes, setMensajesRestantes] = useState(10);
  const [esPro, setEsPro] = useState(false);
  const [cargandoLimite, setCargandoLimite] = useState(true);
  const scrollRef = useRef();

  useEffect(() => {
    cargarMensajeInicial();
    verificarLimite();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const cargarMensajeInicial = async () => {
    try {
      const mensajesGuardados = await AsyncStorage.getItem('@mensajes_felizologo');
      if (mensajesGuardados) {
        setMensajes(JSON.parse(mensajesGuardados));
      } else {
        setMensajes([{
          id: '1',
          tipo: 'ia',
          texto: '¡Hola! 👋 Soy tu felizólogo personal de IA, potenciado por Claude.\n\nEstoy aquí para escucharte, apoyarte y ayudarte a entender mejor tus emociones. Todo lo que me cuentes es completamente confidencial.\n\n¿Cómo te sientes hoy?',
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const verificarLimite = async () => {
    try {
      setCargandoLimite(true);
      const deviceId = await getDeviceId();
      
      const verificarLimiteFunc = httpsCallable(functions, 'verificarLimite');
      
      const resultado = await verificarLimiteFunc({ deviceId });
      
      setMensajesRestantes(resultado.data.mensajesRestantes);
      setEsPro(resultado.data.esPro);
      
    } catch (error) {
      console.error('Error verificando límite:', error);
      const hoy = new Date().toISOString().split('T')[0];
      const contadorLocal = await AsyncStorage.getItem(`@contador_${hoy}`);
      const usado = contadorLocal ? parseInt(contadorLocal) : 0;
      setMensajesRestantes(Math.max(0, 10 - usado));
    } finally {
      setCargandoLimite(false);
    }
  };

  const getDeviceId = async () => {
    try {
      let deviceId = await AsyncStorage.getItem('@device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('@device_id', deviceId);
      }
      return deviceId;
    } catch {
      return `device_${Date.now()}`;
    }
  };

  const enviarMensaje = async () => {
    if (!textoInput.trim()) return;

    if (!esPro && mensajesRestantes <= 0) {
      mostrarModalPro();
      return;
    }

    const esCrisis = detectarCrisisLocal(textoInput);
    if (esCrisis) {
      mostrarAlertaCrisis();
      return;
    }

    const mensajeUsuario = {
      id: Date.now().toString(),
      tipo: 'usuario',
      texto: textoInput,
      timestamp: Date.now()
    };

    const nuevosMensajes = [...mensajes, mensajeUsuario];
    setMensajes(nuevosMensajes);
    setTextoInput('');
    setCargando(true);

    try {
      const contexto = await obtenerContextoUsuario();

      const chatFelizologoFunc = httpsCallable(functions, 'chatFelizologo');

      const resultado = await chatFelizologoFunc({
        mensaje: textoInput,
        historial: mensajes.slice(-10),
        contextoUsuario: contexto
      });

      const mensajeIA = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        texto: resultado.data.respuesta,
        timestamp: Date.now()
      };

      const mensajesActualizados = [...nuevosMensajes, mensajeIA];
      setMensajes(mensajesActualizados);
      
      await AsyncStorage.setItem('@mensajes_felizologo', JSON.stringify(mensajesActualizados));

      if (!esPro) {
        await incrementarContador();
        setMensajesRestantes(prev => Math.max(0, prev - 1));
      }

      if (resultado.data.crisis) {
        setTimeout(() => mostrarAlertaCrisis(), 1000);
      }

    } catch (error) {
      console.error('Error completo:', error);

      let errorMessage = 'No pude procesar tu mensaje. ';

      if (error.code === 'functions/not-found') {
        errorMessage += 'La función del servidor no está disponible. Por favor, contacta al desarrollador.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage += 'No tienes permisos para usar esta función.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage += 'Necesitas iniciar sesión.';
      } else if (error.message) {
        errorMessage += `Detalles: ${error.message}`;
      } else {
        errorMessage += 'Verifica tu conexión a internet e intenta de nuevo.';
      }

      Alert.alert(
        'Error de Conexión',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setCargando(false);
    }
  };

  const obtenerContextoUsuario = async () => {
    try {
      const historial = await StorageService.cargarHistorial();
      const rachas = await StorageService.obtenerRachas();
      
      if (historial.length === 0) {
        return {
          mediaFelicidad: null,
          rachaActual: 0,
          categoriasMasBajas: [],
          tendencia: 'Sin datos suficientes'
        };
      }

      const ultimos7 = historial.slice(0, 7);
      const media = ultimos7.reduce((sum, d) => sum + d.mediaDelDia, 0) / ultimos7.length;

      const ultimoRegistro = historial[0];
      const categorias = ultimoRegistro.categorias || [];
      const ordenadas = [...categorias].sort((a, b) => a.puntuacion - b.puntuacion);
      const masBajas = ordenadas.slice(0, 2).map(c => c.nombre);

      let tendencia = 'estable';
      if (historial.length >= 7) {
        const mediaAnterior = historial.slice(7, 14).reduce((sum, d) => sum + d.mediaDelDia, 0) / 7;
        if (media > mediaAnterior + 0.5) tendencia = 'mejorando';
        else if (media < mediaAnterior - 0.5) tendencia = 'empeorando';
      }

      return {
        mediaFelicidad: media.toFixed(1),
        rachaActual: rachas.actual || 0,
        categoriasMasBajas: masBajas,
        tendencia
      };
    } catch (error) {
      console.error('Error obteniendo contexto:', error);
      return {
        mediaFelicidad: null,
        rachaActual: 0,
        categoriasMasBajas: [],
        tendencia: 'Sin datos'
      };
    }
  };

  const incrementarContador = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const contadorKey = `@contador_${hoy}`;
      const contadorActual = await AsyncStorage.getItem(contadorKey);
      const nuevo = (contadorActual ? parseInt(contadorActual) : 0) + 1;
      await AsyncStorage.setItem(contadorKey, nuevo.toString());

      const deviceId = await getDeviceId();
      const incrementarFunc = httpsCallable(functions, 'incrementarContador');
      await incrementarFunc({ deviceId });
    } catch (error) {
      console.error('Error incrementando contador:', error);
    }
  };

  const detectarCrisisLocal = (texto) => {
    const palabrasCrisis = [
      'suicidio', 'suicidarme', 'matarme', 
      'autolesión', 'cortarme', 'hacerme daño',
      'no quiero vivir', 'quiero morir'
    ];
    const textoLower = texto.toLowerCase();
    return palabrasCrisis.some(palabra => textoLower.includes(palabra));
  };

  const mostrarAlertaCrisis = () => {
    Alert.alert(
      '🆘 Apoyo Inmediato Disponible',
      'Noto que estás pasando por un momento muy difícil. Por favor, considera contactar con un profesional de salud mental o servicios de emergencia:\n\n' +
      '📞 Teléfono de la Esperanza: 717 003 717\n' +
      '📞 Emergencias: 112\n' +
      '📞 Salud Mental 24h: 900 10 10 61\n\n' +
      'Tu vida tiene valor y hay personas que quieren ayudarte.',
      [
        { 
          text: 'Llamar Ahora', 
          onPress: () => Linking.openURL('tel:717003717')
        },
        { text: 'Entendido', style: 'cancel' }
      ]
    );
  };

  const mostrarModalPro = () => {
    Alert.alert(
      '💬 Límite Alcanzado',
      'Has alcanzado el límite diario de 10 mensajes gratuitos.\n\n' +
      'Compra tokens para continuar conversando:\n' +
      '• 1 token = 1 mensaje\n' +
      '• Los tokens nunca caducan\n' +
      '• Pago único, sin suscripción\n' +
      '• Desde 1.99€ (10 tokens)',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar Tokens',
          onPress: () => {
            router.push('/comprar-tokens');
          }
        }
      ]
    );
  };

  const borrarHistorial = () => {
    Alert.alert(
      'Borrar Conversación',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@mensajes_felizologo');
            cargarMensajeInicial();
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={{ backgroundColor: colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <MessageCircle size={28} color="white" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
                Felisólogo Personal
              </Text>
            </View>
          </View>

          {!esPro && !cargandoLimite && (
            <TouchableOpacity
              onPress={mostrarModalPro}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                {mensajesRestantes} / 10
              </Text>
            </TouchableOpacity>
          )}

          {esPro && (
            <View style={{ 
              backgroundColor: '#fbbf24', 
              paddingHorizontal: 10, 
              paddingVertical: 5, 
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}>
              <Crown size={14} color="white" />
              <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
                PRO
              </Text>
            </View>
          )}
        </View>

        <View style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 8,
          padding: 10,
          marginTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8
        }}>
          <AlertCircle size={16} color="white" />
          <Text style={{ color: 'white', fontSize: 11, flex: 1, lineHeight: 16 }}>
            Esta IA es apoyo emocional, no reemplaza terapia profesional
          </Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollRef}
        style={{ flex: 1, padding: 16 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {mensajes.map((mensaje) => (
          <View
            key={mensaje.id}
            style={{
              alignSelf: mensaje.tipo === 'usuario' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              marginBottom: 16
            }}
          >
            {mensaje.tipo === 'ia' && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 6,
                gap: 6
              }}>
                <MessageCircle size={16} color={colors.primary} />
                <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>
                  Felizólogo IA
                </Text>
              </View>
            )}

            <View
              style={{
                backgroundColor: mensaje.tipo === 'usuario' ? colors.primary : colors.surface,
                padding: 14,
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: isDark && mensaje.tipo !== 'usuario' ? 1 : 0,
                borderColor: colors.border
              }}
            >
              <Text style={{
                color: mensaje.tipo === 'usuario' ? 'white' : colors.text,
                fontSize: 15,
                lineHeight: 22
              }}>
                {mensaje.texto}
              </Text>
            </View>

            <Text style={{
              fontSize: 11,
              color: colors.textSecondary,
              marginTop: 4,
              alignSelf: mensaje.tipo === 'usuario' ? 'flex-end' : 'flex-start'
            }}>
              {new Date(mensaje.timestamp).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        ))}

        {cargando && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border
            }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
                Pensando...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 4
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: colors.inputBackground,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 15,
              maxHeight: 100,
              color: colors.text
            }}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor={colors.placeholder}
            value={textoInput}
            onChangeText={setTextoInput}
            onFocus={() => {
              setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
            multiline
            editable={true}
          />
          <TouchableOpacity
            onPress={enviarMensaje}
            disabled={!textoInput.trim() || cargando}
            style={{
              backgroundColor:
                textoInput.trim() && !cargando
                  ? colors.primary
                  : colors.inputBorder,
              width: 44,
              height: 44,
              borderRadius: 22,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>

        {mensajes.length > 1 && (
          <TouchableOpacity
            onPress={borrarHistorial}
            style={{ alignSelf: 'center', marginTop: 8 }}
          >
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>
              Borrar conversación
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}