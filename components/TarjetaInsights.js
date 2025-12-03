import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import InsightsService from '../services/insights';
import { useTheme } from '../contexts/ThemeContext';

const TarjetaInsights = () => {
  const { colors, isDark } = useTheme();
  const [insights, setInsights] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarInsights();
  }, []);

  const cargarInsights = async () => {
    try {
      setCargando(true);
      const insightsGenerados = await InsightsService.generarTodosInsights();
      setInsights(insightsGenerados || []);
    } catch (error) {
      console.error('Error cargando insights:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
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
        alignItems: 'center',
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border
      }}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={{ marginTop: 8, color: colors.textSecondary, fontSize: 14 }}>
          Analizando patrones...
        </Text>
      </View>
    );
  }

  if (insights.length === 0) {
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Lightbulb size={24} color={colors.primary} />
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginLeft: 8,
          }}>
            Insights Personalizados
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          Necesitas al menos 7 días de registros para ver insights personalizados.
        </Text>
      </View>
    );
  }

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
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Lightbulb size={24} color={colors.primary} />
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.text,
          marginLeft: 8,
        }}>
          Insights Personalizados
        </Text>
      </View>

      {insights.map((insight, index) => (
        <View
          key={index}
          style={{
            backgroundColor: `${insight.color}${isDark ? '20' : '10'}`,
            borderLeftWidth: 4,
            borderLeftColor: insight.color,
            borderRadius: 8,
            padding: 12,
            marginBottom: index < insights.length - 1 ? 12 : 0,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>
              {insight.icono}
            </Text>
            <Text style={{
              flex: 1,
              fontSize: 14,
              color: colors.text,
              lineHeight: 20,
            }}>
              {insight.mensaje}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default TarjetaInsights;
