import React from 'react';
import { View, Text } from 'react-native';
import { Flame, Award, TrendingUp } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

const TarjetaRachas = ({ rachaActual, mejorRacha }) => {
  const { colors, isDark } = useTheme();

  const obtenerMensajeMotivacion = (racha) => {
    if (racha === 0) return '¡Empieza tu racha hoy!';
    if (racha === 1) return '¡Buen comienzo!';
    if (racha < 7) return '¡Sigue así!';
    if (racha < 14) return '¡Una semana completa!';
    if (racha < 30) return '¡Increíble constancia!';
    if (racha < 100) return '¡Eres una máquina!';
    return '¡LEYENDA! 🏆';
  };

  const obtenerColorRacha = (racha) => {
    if (racha === 0) return '#9ca3af';
    if (racha < 7) return '#f59e0b';
    if (racha < 30) return '#10b981';
    return colors.primary;
  };

  const colorRacha = obtenerColorRacha(rachaActual);

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border
    }}>
      {/* Título */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Flame size={24} color={colorRacha} />
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.text,
          marginLeft: 8,
        }}>
          Tu Racha
        </Text>
      </View>

      {/* Racha principal */}
      <View style={{
        backgroundColor: rachaActual === 0 ? colors.inputBackground : `${colorRacha}${isDark ? '30' : '15'}`,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: rachaActual === 0 ? colors.border : colorRacha,
      }}>
        <Text style={{
          fontSize: 48,
          fontWeight: 'bold',
          color: colorRacha,
        }}>
          {rachaActual}
        </Text>
        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
          marginTop: 4,
        }}>
          {rachaActual === 1 ? 'día consecutivo' : 'días consecutivos'}
        </Text>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: colorRacha,
          marginTop: 8,
        }}>
          {obtenerMensajeMotivacion(rachaActual)}
        </Text>
      </View>

      {/* Estadísticas secundarias */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-around',
      }}>
        {/* Mejor racha */}
        <View style={{ 
          alignItems: 'center',
          flex: 1,
        }}>
          <View style={{ 
            backgroundColor: '#fef3c7',
            padding: 10,
            borderRadius: 10,
            marginBottom: 8,
          }}>
            <Award size={24} color="#f59e0b" />
          </View>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
          }}>
            {mejorRacha}
          </Text>
          <Text style={{
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: 'center',
          }}>
            Mejor racha
          </Text>
        </View>

        {/* Progreso semanal */}
        <View style={{ 
          alignItems: 'center',
          flex: 1,
        }}>
          <View style={{ 
            backgroundColor: '#dbeafe',
            padding: 10,
            borderRadius: 10,
            marginBottom: 8,
          }}>
            <TrendingUp size={24} color="#3b82f6" />
          </View>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
          }}>
            {rachaActual >= 7 ? '7/7' : `${rachaActual}/7`}
          </Text>
          <Text style={{
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: 'center',
          }}>
            Esta semana
          </Text>
        </View>

        {/* Próximo hito */}
        <View style={{
          alignItems: 'center',
          flex: 1,
        }}>
          <View style={{
            backgroundColor: isDark ? '#6b21a850' : '#e9d5ff',
            padding: 10,
            borderRadius: 10,
            marginBottom: 8,
          }}>
            <Text style={{ fontSize: 24 }}>🎯</Text>
          </View>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
          }}>
            {rachaActual < 7 ? 7 : rachaActual < 30 ? 30 : rachaActual < 100 ? 100 : 365}
          </Text>
          <Text style={{
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: 'center',
          }}>
            Próximo hito
          </Text>
        </View>
      </View>

      {/* Mensaje motivacional */}
      {rachaActual > 0 && (
        <View style={{
          backgroundColor: isDark ? '#10b98130' : '#f0fdf4',
          borderRadius: 8,
          padding: 12,
          marginTop: 16,
          borderLeftWidth: 4,
          borderLeftColor: colors.success,
        }}>
          <Text style={{
            fontSize: 13,
            color: colors.text,
            lineHeight: 18,
          }}>
            {rachaActual === mejorRacha && mejorRacha > 0
              ? '🔥 ¡Nuevo récord personal! Estás en tu mejor racha.'
              : `¡Genial! Solo te faltan ${mejorRacha - rachaActual} días para igualar tu mejor racha.`}
          </Text>
        </View>
      )}
    </View>
  );
};

export default TarjetaRachas;
