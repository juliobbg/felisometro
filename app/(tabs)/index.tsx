import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Trash2, Plus, TrendingUp, Smile } from 'lucide-react-native';

export default function HomeScreen() {
  const categoriasDefault = [
    { id: '1', nombre: 'Comida', puntuacion: 5 },
    { id: '2', nombre: 'Deporte', puntuacion: 5 },
    { id: '3', nombre: 'Familia', puntuacion: 5 },
    { id: '4', nombre: 'Amistad', puntuacion: 5 },
    { id: '5', nombre: 'Ocio', puntuacion: 5 },
    { id: '6', nombre: 'Trabajo', puntuacion: 5 },
  ];

  const [categorias, setCategorias] = useState(categoriasDefault);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const calcularMedia = () => {
    if (categorias.length === 0) return 0;
    const suma = categorias.reduce((acc, cat) => acc + cat.puntuacion, 0);
    return (suma / categorias.length).toFixed(1);
  };

  const actualizarPuntuacion = (id, nuevaPuntuacion) => {
    setCategorias(categorias.map(cat =>
      cat.id === id ? { ...cat, puntuacion: nuevaPuntuacion } : cat
    ));
  };

  const eliminarCategoria = (id) => {
    Alert.alert(
      'Eliminar categoría',
      '¿Estás seguro de que quieres eliminar esta categoría?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => setCategorias(categorias.filter(cat => cat.id !== id))
        }
      ]
    );
  };

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
  };

  const media = calcularMedia();
  const colorMedia = media >= 7 ? '#10b981' : media >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#8b5cf6', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
          Tu Felicidad
        </Text>
        <Text style={{ fontSize: 16, color: '#e9d5ff' }}>
          Mide tu bienestar diario
        </Text>
      </View>

      {/* Medidor de felicidad */}
      <View style={{ backgroundColor: 'white', marginHorizontal: 20, marginTop: -20, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colorMedia, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: 'white' }}>
              {media}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
            Nivel de Felicidad
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>
            {media >= 7 ? '¡Excelente! 😊' : media >= 5 ? 'Bien, pero puedes mejorar 🙂' : 'Cuida tu bienestar 😔'}
          </Text>
        </View>
      </View>

      {/* Lista de categorías */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
            Categorías
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{ backgroundColor: '#8b5cf6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} color="white" />
            <Text style={{ color: 'white', fontWeight: '600' }}>Añadir</Text>
          </TouchableOpacity>
        </View>

        {categorias.map((categoria) => (
          <View key={categoria.id} style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                {categoria.nombre}
              </Text>
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
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: categoria.puntuacion >= num ? 'white' : '#9ca3af' }}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
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
              style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 }}
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
                style={{ flex: 1, backgroundColor: '#e5e7eb', padding: 14, borderRadius: 8, alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '600', color: '#374151' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={agregarCategoria}
                style={{ flex: 1, backgroundColor: '#8b5cf6', padding: 14, borderRadius: 8, alignItems: 'center' }}
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