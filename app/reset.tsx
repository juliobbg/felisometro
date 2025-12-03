import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function ResetScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [resetting, setResetting] = useState(false);

  const resetAllData = async () => {
    Alert.alert(
      '⚠️ Resetear App',
      '¿Estás seguro? Esto borrará:\n\n• Datos de onboarding\n• Todas las categorías\n• Historial completo\n• Notas diarias\n• Mensajes del Felizólogo\n• Límite de mensajes\n\nEsta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear Todo',
          style: 'destructive',
          onPress: async () => {
            try {
              setResetting(true);

              // Eliminar todos los datos
              await AsyncStorage.multiRemove([
                'userData',
                '@categorias',
                '@historial',
                '@mensajes_felizologo',
                '@limite_mensajes',
                '@es_pro'
              ]);

              Alert.alert(
                '✓ Reseteo Completo',
                'Todos los datos han sido eliminados. La app se reiniciará.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace('/');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error reseteando datos:', error);
              Alert.alert('Error', 'No se pudieron resetear los datos');
            } finally {
              setResetting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Resetear Datos de la App
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Usa esta pantalla para borrar todos los datos y empezar de nuevo.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ef4444' }]}
          onPress={resetAllData}
          disabled={resetting}
        >
          <Text style={styles.buttonText}>
            {resetting ? 'Reseteando...' : 'Resetear Todos los Datos'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
