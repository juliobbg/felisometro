import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUser } from '../contexts/UserContext';

export default function Index() {
  const { userData, isLoading } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!userData?.hasCompletedOnboarding) {
      // Usuario no ha completado el onboarding, redirigir
      router.replace('/onboarding');
    } else if (!inAuthGroup) {
      // Usuario completó onboarding, ir a tabs
      router.replace('/(tabs)');
    }
  }, [userData, isLoading, segments]);

  // Mostrar pantalla de carga mientras se verifica
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#14b8a6" />
    </View>
  );
}
