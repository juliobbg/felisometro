import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Crown, MessageCircle, Check, ExternalLink, Info } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase.config';

interface PaqueteTokens {
  id: string;
  tokens: number;
  precio: number; // Precio sin IVA
  precioConIVA: number; // Precio con IVA 21%
  popular?: boolean;
  ahorras?: string;
  stripeUrl: string; // URL del Payment Link de Stripe
}

export default function ComprarTokensScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [tokensActuales, setTokensActuales] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [cargandoTokens, setCargandoTokens] = useState(true);
  const [codigoCompra, setCodigoCompra] = useState('');
  const [modalCodigoVisible, setModalCodigoVisible] = useState(false);

  const IVA = 0.21; // IVA español 21%

  const paquetes: PaqueteTokens[] = [
    {
      id: 'pack_10',
      tokens: 10,
      precio: 1.99,
      precioConIVA: 2.41,
      stripeUrl: 'https://buy.stripe.com/cNi8wPd6s88q5iMeC5',
    },
    {
      id: 'pack_50',
      tokens: 50,
      precio: 7.99,
      precioConIVA: 9.67,
      popular: true,
      ahorras: '20%',
      stripeUrl: 'https://buy.stripe.com/14A00j4zWewO12wbpT',
    },
    {
      id: 'pack_100',
      tokens: 100,
      precio: 12.99,
      precioConIVA: 15.72,
      ahorras: '35%',
      stripeUrl: 'https://buy.stripe.com/28EbJ11nKewOdPi79D',
    },
    {
      id: 'pack_250',
      tokens: 250,
      precio: 24.99,
      precioConIVA: 30.24,
      ahorras: '50%',
      stripeUrl: 'https://buy.stripe.com/3cIfZh7M89cu6mQ1Pj',
    },
  ];

  useEffect(() => {
    cargarTokensActuales();
  }, []);

  const cargarTokensActuales = async () => {
    try {
      setCargandoTokens(true);
      const deviceId = await getDeviceId();
      const verificarTokensFunc = httpsCallable(functions, 'verificarTokens');
      const resultado = await verificarTokensFunc({ deviceId });
      setTokensActuales(resultado.data.tokens || 0);
    } catch (error) {
      console.error('Error cargando tokens:', error);
      const tokensLocal = await AsyncStorage.getItem('@tokens');
      setTokensActuales(tokensLocal ? parseInt(tokensLocal) : 0);
    } finally {
      setCargandoTokens(false);
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

  const comprarPaquete = async (paquete: PaqueteTokens) => {
    Alert.alert(
      '💳 Realizar Pago',
      `Vas a comprar ${paquete.tokens} tokens por ${paquete.precioConIVA.toFixed(2)}€ (IVA incluido)\n\n` +
      `Desglose:\n` +
      `• Base: ${paquete.precio.toFixed(2)}€\n` +
      `• IVA (21%): ${(paquete.precio * IVA).toFixed(2)}€\n` +
      `• Total: ${paquete.precioConIVA.toFixed(2)}€\n\n` +
      `¿Deseas continuar con el pago?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar',
          onPress: () => iniciarPago(paquete),
        },
      ]
    );
  };

  const iniciarPago = async (paquete: PaqueteTokens) => {
    try {
      setCargando(true);

      // Abrir directamente el Payment Link de Stripe
      await Linking.openURL(paquete.stripeUrl);

      Alert.alert(
        'Pago Iniciado',
        'Te hemos redirigido a la página de pago segura de Stripe.\n\n📧 IMPORTANTE: \n\n1. Completa el pago en Stripe\n2. Recibirás un email con tu recibo\n3. En el email, busca un código que empieza con "pi_"\n4. Vuelve a la app y usa "Restaurar Compras"\n5. Introduce ese código para recibir tus tokens',
        [
          {
            text: 'Entendido',
          },
        ]
      );
    } catch (error) {
      console.error('Error abriendo página de pago:', error);
      Alert.alert(
        'Error',
        'No se pudo abrir la página de pago. Por favor, verifica tu conexión a internet.'
      );
    } finally {
      setCargando(false);
    }
  };

  const restaurarCompras = async () => {
    setModalCodigoVisible(true);
  };

  const canjearCodigo = async () => {
    if (!codigoCompra.trim()) {
      Alert.alert('Error', 'Por favor, introduce el código de compra.');
      return;
    }

    try {
      setCargando(true);
      const deviceId = await getDeviceId();

      const canjearCodigoFunc = httpsCallable(functions, 'canjearCodigoCompra');
      const resultado = await canjearCodigoFunc({
        deviceId,
        codigoCompra: codigoCompra.trim(),
      });

      if (resultado.data.success) {
        setModalCodigoVisible(false);
        setCodigoCompra('');
        await cargarTokensActuales();

        Alert.alert(
          '✅ ¡Tokens Añadidos!',
          `Se han añadido ${resultado.data.tokensAñadidos} tokens a tu cuenta.\n\nTotal actual: ${resultado.data.tokensActuales} tokens`,
          [{ text: 'Genial!' }]
        );
      } else {
        Alert.alert('Error', resultado.data.error || 'Código inválido o ya usado.');
      }
    } catch (error) {
      console.error('Error canjeando código:', error);
      Alert.alert(
        'Error',
        'No se pudo canjear el código. Verifica que sea correcto y que no lo hayas usado antes.'
      );
    } finally {
      setCargando(false);
    }
  };

  const mostrarInfoIVA = () => {
    Alert.alert(
      'ℹ️ Información Fiscal',
      'Todos los precios incluyen el IVA español (21%) según la normativa vigente.\n\n' +
      'Al realizar una compra recibirás una factura completa con todos los datos fiscales necesarios.\n\n' +
      'Los pagos se procesan de forma segura a través de Stripe, cumpliendo con PCI DSS y todas las regulaciones europeas de protección de datos (GDPR).'
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.9)',
    },
    tokensCard: {
      backgroundColor: colors.surface,
      margin: 20,
      padding: 20,
      borderRadius: 16,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    tokensLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    tokensAmount: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
    },
    tokensDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginHorizontal: 20,
      marginBottom: 16,
    },
    paqueteCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 20,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    paquetePopular: {
      borderColor: colors.primary,
      backgroundColor: isDark ? colors.surface : '#f0fdf9',
    },
    popularBadge: {
      position: 'absolute',
      top: -10,
      right: 20,
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    popularText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    paqueteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    tokensCount: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
    },
    tokensSuffix: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    precio: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
    },
    precioDetalle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    ahorrasBadge: {
      backgroundColor: '#10b981',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    ahorrasText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    beneficios: {
      marginVertical: 12,
    },
    beneficioRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    beneficioText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    comprarButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    comprarButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    infoSection: {
      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#eff6ff',
      margin: 20,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : '#dbeafe',
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 4,
    },
    footerButtons: {
      flexDirection: 'row',
      gap: 12,
      marginHorizontal: 20,
      marginBottom: 30,
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: isDark ? colors.surface : '#f3f4f6',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    modalContent: {
      width: '85%',
      maxWidth: 400,
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: 14,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 20,
    },
    codigoInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      marginBottom: 20,
      fontFamily: 'monospace',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comprar Tokens</Text>
        <Text style={styles.headerSubtitle}>
          Continúa conversando con tu Felizólogo IA
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tokensCard}>
          <Text style={styles.tokensLabel}>Tus tokens disponibles</Text>
          {cargandoTokens ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={styles.tokensAmount}>{tokensActuales}</Text>
                <MessageCircle
                  size={24}
                  color={colors.primary}
                  style={{ marginLeft: 8 }}
                />
              </View>
              <Text style={styles.tokensDescription}>
                1 token = 1 mensaje con el Felizólogo
              </Text>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Elige tu paquete</Text>

        {paquetes.map((paquete) => (
          <View
            key={paquete.id}
            style={[
              styles.paqueteCard,
              paquete.popular && styles.paquetePopular,
            ]}
          >
            {paquete.popular && (
              <View style={styles.popularBadge}>
                <Crown size={12} color="white" />
                <Text style={styles.popularText}>MÁS POPULAR</Text>
              </View>
            )}

            <View style={styles.paqueteHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={styles.tokensCount}>{paquete.tokens}</Text>
                <Text style={styles.tokensSuffix}>tokens</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.precio}>
                  {paquete.precioConIVA.toFixed(2)}€
                </Text>
                <Text style={styles.precioDetalle}>IVA incluido</Text>
              </View>
            </View>

            {paquete.ahorras && (
              <View style={styles.ahorrasBadge}>
                <Text style={styles.ahorrasText}>
                  Ahorras {paquete.ahorras}
                </Text>
              </View>
            )}

            <View style={styles.beneficios}>
              <View style={styles.beneficioRow}>
                <Check size={16} color={colors.primary} />
                <Text style={styles.beneficioText}>
                  {paquete.tokens} conversaciones con tu Felizólogo
                </Text>
              </View>
              <View style={styles.beneficioRow}>
                <Check size={16} color={colors.primary} />
                <Text style={styles.beneficioText}>
                  Respuestas personalizadas con IA
                </Text>
              </View>
              <View style={styles.beneficioRow}>
                <Check size={16} color={colors.primary} />
                <Text style={styles.beneficioText}>
                  Los tokens nunca caducan
                </Text>
              </View>
              <View style={styles.beneficioRow}>
                <Check size={16} color={colors.primary} />
                <Text style={styles.beneficioText}>
                  Pago único, sin suscripción
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.comprarButton}
              onPress={() => comprarPaquete(paquete)}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.comprarButtonText}>Comprar Ahora</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.infoSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Info size={18} color={colors.primary} />
            <Text style={styles.infoTitle}>Información de Pago</Text>
          </View>
          <Text style={styles.infoText}>
            • Pago 100% seguro procesado por Stripe
          </Text>
          <Text style={styles.infoText}>
            • Todos los precios incluyen IVA español (21%)
          </Text>
          <Text style={styles.infoText}>
            • Recibirás una factura completa por email
          </Text>
          <Text style={styles.infoText}>
            • Los tokens se añaden instantáneamente
          </Text>
          <Text style={styles.infoText}>
            • Cumplimos con GDPR y normativa europea
          </Text>
          <TouchableOpacity
            onPress={mostrarInfoIVA}
            style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
              Más información fiscal
            </Text>
            <ExternalLink size={12} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={restaurarCompras}
            disabled={cargando}
          >
            <Text style={styles.secondaryButtonText}>Restaurar Compras</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para introducir código de compra */}
      <Modal
        visible={modalCodigoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalCodigoVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Canjear Código de Compra
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Introduce el código que recibiste en tu email de Stripe después de realizar el pago.
            </Text>

            <TextInput
              style={[styles.codigoInput, {
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.inputBorder
              }]}
              placeholder="pi_3AbC123..."
              placeholderTextColor={colors.placeholder}
              value={codigoCompra}
              onChangeText={setCodigoCompra}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                onPress={() => {
                  setModalCodigoVisible(false);
                  setCodigoCompra('');
                }}
                disabled={cargando}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={canjearCodigo}
                disabled={cargando || !codigoCompra.trim()}
              >
                {cargando ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: 'white' }]}>Canjear</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
