import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../contexts/ThemeContext';

const GraficoEvolucion = ({ datos, titulo = 'Últimos 7 días' }) => {
  const { colors, isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  // Preparar datos para el gráfico
  const prepararDatos = () => {
    if (!datos || datos.length === 0) {
      return {
        labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
        datasets: [{ data: [5, 5, 5, 5, 5, 5, 5] }],
      };
    }

    // Obtener últimos 7 días
    const ultimos7 = datos.slice(0, 7).reverse();
    
    const labels = ultimos7.map(d => {
      const fecha = new Date(d.fecha);
      const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
      return dias[fecha.getDay()];
    });

    const valores = ultimos7.map(d => d.mediaDelDia);

    return {
      labels,
      datasets: [{ data: valores }],
    };
  };

  const datosGrafico = prepararDatos();

  // Configuración del gráfico
  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => isDark ? `rgba(179, 217, 217, ${opacity})` : `rgba(153, 204, 204, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(209, 213, 219, ${opacity})` : `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeWidth: 1,
    },
  };

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
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
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
      }}>
        {titulo}
      </Text>

      <LineChart
        data={datosGrafico}
        width={screenWidth - 72}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={{
          borderRadius: 12,
        }}
        yAxisSuffix=""
        yAxisInterval={1}
        fromZero
        segments={5}
      />

      {datos && datos.length > 0 && (
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around',
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
              Promedio
            </Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
              {(datos.slice(0, 7).reduce((sum, d) => sum + d.mediaDelDia, 0) / Math.min(7, datos.length)).toFixed(1)}
            </Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
              Mejor día
            </Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.success }}>
              {Math.max(...datos.slice(0, 7).map(d => d.mediaDelDia)).toFixed(1)}
            </Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
              Registros
            </Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.warning }}>
              {Math.min(7, datos.length)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default GraficoEvolucion;
