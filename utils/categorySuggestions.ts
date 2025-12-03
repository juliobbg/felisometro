// Sistema de sugerencias de categorías personalizadas según edad y sexo

interface CategorySuggestion {
  name: string;
  icon: string;
}

export function getCategorySuggestions(
  age: number | null,
  sex: 'masculino' | 'femenino' | 'otro'
): CategorySuggestion[] {
  const suggestions: CategorySuggestion[] = [];

  // Categorías universales (todos)
  const universal: CategorySuggestion[] = [
    { name: 'Familia', icon: '👨‍👩‍👧‍👦' },
    { name: 'Amigos', icon: '👥' },
    { name: 'Salud', icon: '💪' },
    { name: 'Trabajo', icon: '💼' },
    { name: 'Hobbies', icon: '🎨' },
    { name: 'Descanso', icon: '😴' },
  ];

  suggestions.push(...universal);

  if (!age) return suggestions;

  // Menores de 18 años
  if (age < 18) {
    suggestions.push(
      { name: 'Estudios', icon: '📚' },
      { name: 'Videojuegos', icon: '🎮' },
      { name: 'Deporte', icon: '⚽' },
      { name: 'Redes Sociales', icon: '📱' },
      { name: 'Música', icon: '🎵' }
    );
  }

  // 18-25 años (jóvenes adultos)
  else if (age >= 18 && age <= 25) {
    suggestions.push(
      { name: 'Universidad', icon: '🎓' },
      { name: 'Carrera', icon: '🚀' },
      { name: 'Pareja', icon: '❤️' },
      { name: 'Fiestas', icon: '🎉' },
      { name: 'Viajes', icon: '✈️' },
      { name: 'Deporte', icon: '🏃' }
    );

    if (sex === 'masculino') {
      suggestions.push(
        { name: 'Gaming', icon: '🎮' },
        { name: 'Gimnasio', icon: '🏋️' }
      );
    } else if (sex === 'femenino') {
      suggestions.push(
        { name: 'Belleza', icon: '💄' },
        { name: 'Moda', icon: '👗' }
      );
    }
  }

  // 26-40 años (adultos establecidos)
  else if (age >= 26 && age <= 40) {
    suggestions.push(
      { name: 'Pareja', icon: '💑' },
      { name: 'Hijos', icon: '👶' },
      { name: 'Carrera profesional', icon: '📈' },
      { name: 'Finanzas', icon: '💰' },
      { name: 'Casa', icon: '🏠' },
      { name: 'Ejercicio', icon: '🏃‍♂️' },
      { name: 'Desarrollo personal', icon: '📖' }
    );

    if (sex === 'masculino') {
      suggestions.push(
        { name: 'Proyectos', icon: '🔧' },
        { name: 'Inversiones', icon: '📊' }
      );
    } else if (sex === 'femenino') {
      suggestions.push(
        { name: 'Autocuidado', icon: '🧘‍♀️' },
        { name: 'Organización', icon: '📋' }
      );
    }
  }

  // 41-60 años (madurez)
  else if (age >= 41 && age <= 60) {
    suggestions.push(
      { name: 'Familia', icon: '👨‍👩‍👧‍👦' },
      { name: 'Salud', icon: '🏥' },
      { name: 'Hijos adolescentes', icon: '👦👧' },
      { name: 'Jubilación', icon: '💼' },
      { name: 'Patrimonio', icon: '🏡' },
      { name: 'Relación de pareja', icon: '💕' },
      { name: 'Tiempo libre', icon: '⏰' },
      { name: 'Espiritualidad', icon: '🙏' }
    );

    if (sex === 'masculino') {
      suggestions.push(
        { name: 'Logros profesionales', icon: '🏆' },
        { name: 'Herencia', icon: '📜' }
      );
    } else if (sex === 'femenino') {
      suggestions.push(
        { name: 'Bienestar', icon: '🌸' },
        { name: 'Conexiones sociales', icon: '☕' }
      );
    }
  }

  // Mayores de 60 años
  else if (age > 60) {
    suggestions.push(
      { name: 'Salud', icon: '❤️‍🩹' },
      { name: 'Nietos', icon: '👵👴' },
      { name: 'Pareja', icon: '💑' },
      { name: 'Jubilación', icon: '🌅' },
      { name: 'Tranquilidad', icon: '☮️' },
      { name: 'Recuerdos', icon: '📸' },
      { name: 'Naturaleza', icon: '🌳' },
      { name: 'Lectura', icon: '📚' },
      { name: 'Paseos', icon: '🚶' }
    );
  }

  // Eliminar duplicados manteniendo el orden
  const seen = new Set<string>();
  return suggestions.filter(item => {
    if (seen.has(item.name)) {
      return false;
    }
    seen.add(item.name);
    return true;
  });
}
