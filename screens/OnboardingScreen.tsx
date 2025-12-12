import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { setUserData } = useUser();
  const router = useRouter();

  const [birthDateText, setBirthDateText] = useState('');
  const [sex, setSex] = useState<'masculino' | 'femenino' | null>(null);

  const handleDateInput = (text: string) => {
    // Eliminar todo excepto números
    const numbersOnly = text.replace(/[^\d]/g, '');

    let formatted = '';

    // Formatear automáticamente DD/MM/AAAA
    if (numbersOnly.length > 0) {
      formatted = numbersOnly.substring(0, 2); // DD
      if (numbersOnly.length >= 3) {
        formatted += '/' + numbersOnly.substring(2, 4); // MM
      }
      if (numbersOnly.length >= 5) {
        formatted += '/' + numbersOnly.substring(4, 8); // AAAA
      }
    }

    setBirthDateText(formatted);
  };

  const parseBirthDate = (): Date | null => {
    // Aceptar formatos: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    const cleanDate = birthDateText.replace(/[.-]/g, '/');
    const parts = cleanDate.split('/');

    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Los meses en JS van de 0-11
    const year = parseInt(parts[2], 10);

    // Validaciones básicas
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31) return null;
    if (month < 0 || month > 11) return null;
    if (year < 1920 || year > new Date().getFullYear()) return null;

    const date = new Date(year, month, day);

    // Verificar que la fecha es válida
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      return null;
    }

    return date;
  };

  const handleComplete = async () => {
    if (!sex) {
      Alert.alert('Error', 'Por favor, selecciona tu sexo');
      return;
    }

    if (!birthDateText.trim()) {
      Alert.alert('Error', 'Por favor, ingresa tu fecha de nacimiento');
      return;
    }

    const parsedDate = parseBirthDate();
    if (!parsedDate) {
      Alert.alert(
        'Fecha inválida',
        'Por favor, ingresa una fecha válida en formato DD/MM/AAAA\n\nEjemplo: 15/03/1990'
      );
      return;
    }

    await setUserData({
      birthDate: parsedDate.toISOString(),
      sex,
      hasCompletedOnboarding: true,
    });

    router.replace('/(tabs)');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#fff',
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#999' : '#666',
      marginBottom: 40,
      textAlign: 'center',
    },
    section: {
      marginBottom: 30,
    },
    label: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 15,
    },
    dateInput: {
      backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
      padding: 15,
      borderRadius: 10,
      fontSize: 16,
      color: isDark ? '#fff' : '#000',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    hint: {
      fontSize: 12,
      color: isDark ? '#999' : '#666',
      marginTop: 5,
      marginLeft: 5,
    },
    sexButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    sexButton: {
      flex: 1,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    sexButtonSelected: {
      backgroundColor: '#14b8a6',
      borderColor: '#0d9488',
    },
    sexButtonText: {
      fontSize: 16,
      color: isDark ? '#fff' : '#000',
    },
    sexButtonTextSelected: {
      color: '#fff',
      fontWeight: 'bold',
    },
    continueButton: {
      backgroundColor: '#14b8a6',
      padding: 18,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    continueButtonDisabled: {
      backgroundColor: isDark ? '#2a2a2a' : '#ccc',
    },
    continueButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a Felizómetro!</Text>
      <Text style={styles.subtitle}>
        Para personalizar tu experiencia, necesitamos algunos datos
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>Fecha de nacimiento</Text>
        <TextInput
          style={styles.dateInput}
          placeholder="DD/MM/AAAA (ej: 15/03/1990)"
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={birthDateText}
          onChangeText={handleDateInput}
          keyboardType="numeric"
          maxLength={10}
        />
        <Text style={styles.hint}>
          Formato: DD/MM/AAAA
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Sexo</Text>
        <View style={styles.sexButtons}>
          <TouchableOpacity
            style={[
              styles.sexButton,
              sex === 'masculino' && styles.sexButtonSelected,
            ]}
            onPress={() => setSex('masculino')}
          >
            <Text
              style={[
                styles.sexButtonText,
                sex === 'masculino' && styles.sexButtonTextSelected,
              ]}
            >
              Masculino
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sexButton,
              sex === 'femenino' && styles.sexButtonSelected,
            ]}
            onPress={() => setSex('femenino')}
          >
            <Text
              style={[
                styles.sexButtonText,
                sex === 'femenino' && styles.sexButtonTextSelected,
              ]}
            >
              Femenino
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!sex || !birthDateText.trim()) && styles.continueButtonDisabled,
        ]}
        onPress={handleComplete}
        disabled={!sex || !birthDateText.trim()}
      >
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}
