# 🚀 Guía de Publicación en Google Play Store

## 📋 Requisitos Previos

### ✅ Checklist ANTES de Publicar

- [ ] **Sistema de pagos probado** y funcionando
- [ ] **API Keys de producción** configuradas (cambiar de `sk_test_` a `sk_live_`)
- [ ] **Cuenta de Stripe verificada** completamente
- [ ] **Alta como autónomo/empresa** en España
- [ ] **Política de Privacidad** creada y publicada
- [ ] **Términos de Servicio** creados y publicados
- [ ] **Íconos y capturas de pantalla** preparados
- [ ] **APK/AAB** funcionando correctamente

---

## 🔐 PASO 0: Cambiar a Producción

### 1. Configurar API Keys de Producción

#### Anthropic (ya está en producción)
Tu clave actual ya es válida para producción.

#### Stripe
1. Ve a https://dashboard.stripe.com/apikeys
2. Cambia de **"Test mode"** a **"Live mode"** (toggle arriba a la derecha)
3. Copia tu **Secret key de producción** (`sk_live_...`)
4. Configúrala:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_live_TU_CLAVE_DE_PRODUCCION"
   cd functions
   npm run deploy
   ```

### 2. Actualizar Payment Links de Producción

1. En Stripe Dashboard (modo Live), crea nuevos Payment Links para producción
2. Ve a **Products** → Cada producto → **Payment links**
3. Crea un nuevo Payment Link para cada paquete
4. **Actualiza las URLs** en `screens/ComprarTokensScreen.tsx`:

```typescript
const paquetes: PaqueteTokens[] = [
  {
    id: 'pack_10',
    tokens: 10,
    precio: 1.99,
    precioConIVA: 2.41,
    stripeUrl: 'https://buy.stripe.com/NUEVA_URL_PRODUCCION_10_TOKENS',
  },
  // ... actualizar todas las URLs
];
```

### 3. Verificar Cuenta de Stripe

Antes de publicar, completa la verificación de Stripe:
- **Identidad**: DNI/NIE
- **Negocio**: NIF/CIF, datos fiscales
- **Banco**: Cuenta donde recibirás pagos
- **Información del producto**: Qué vendes

---

## 📱 PASO 1: Crear Cuenta de Google Play Console

### 1.1. Registrarse

1. Ve a: https://play.google.com/console/signup
2. Inicia sesión con tu cuenta de Google
3. **Pago único**: 25 USD (aproximadamente 23€)
4. Acepta los términos y condiciones
5. Completa el proceso de pago

### 1.2. Configurar Cuenta

1. **Tipo de cuenta**: Individual o Empresa
   - **Individual**: Si eres autónomo
   - **Empresa**: Si tienes una SL

2. **Información personal/empresarial**:
   - Nombre completo / Razón social
   - Dirección
   - Teléfono
   - Email de contacto

3. **Verificación de identidad** (puede tardar 1-2 días)

---

## 🏗️ PASO 2: Preparar Assets (Recursos)

### 2.1. Íconos de la Aplicación

Ya tienes los íconos en tu proyecto:
- ✅ `assets/images/ic_launcher.png` (512x512)
- ✅ `assets/images/play_store_512.png` (512x512)

### 2.2. Capturas de Pantalla

**Requisitos**:
- **Mínimo**: 2 capturas
- **Máximo**: 8 capturas
- **Formatos**: JPG o PNG de 24 bits
- **Tamaño**:
  - Teléfonos: 320-3840 px en cualquier dimensión
  - Relación de aspecto: 16:9 o 9:16

**Capturas recomendadas**:
1. Pantalla de onboarding
2. Pantalla principal (Felizómetro)
3. Felizólogo (chat)
4. Gráfico de evolución
5. Tarjetas de insights
6. Pantalla de compra de tokens
7. Modo oscuro (opcional)

**Cómo tomar capturas**:
1. Abre el emulador o usa tu teléfono
2. En el emulador: Click en el botón de cámara
3. En teléfono real: Power + Volume Down
4. Guarda en una carpeta: `play_store_assets/screenshots/`

### 2.3. Gráfico de Funciones (Feature Graphic)

**Requisitos**:
- **Tamaño**: 1024 x 500 px
- **Formato**: PNG o JPG de 24 bits
- Sin transparencias

**Crear gráfico**:
Puedes usar Canva, Figma, o cualquier editor. Incluye:
- Logo de Felizómetro
- Texto: "Mide y mejora tu felicidad cada día"
- Colores que coincidan con tu app (verdes/azules)

### 2.4. Video Promocional (Opcional pero Recomendado)

- Link de YouTube
- Duración: 30 segundos a 2 minutos
- Muestra las funcionalidades principales

---

## 📦 PASO 3: Compilar AAB de Producción

### 3.1. Actualizar Versión

Edita `app.json`:

```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 4,
      // ... resto
    }
  }
}
```

### 3.2. Compilar con EAS

```bash
# Para producción, usa el perfil production
eas build --platform android --profile production
```

Si no tienes el perfil `production`, créalo en `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  }
}
```

### 3.3. Descargar AAB

Cuando termine el build:
1. Ve al link que te proporciona EAS
2. Descarga el archivo `.aab` (Android App Bundle)
3. Guárdalo en tu computadora

---

## 🎮 PASO 4: Crear Aplicación en Play Console

### 4.1. Crear Nueva App

1. Ve a: https://play.google.com/console/
2. Click en **"Crear app"**
3. Completa:
   - **Nombre**: Felizómetro
   - **Idioma predeterminado**: Español (España)
   - **App o juego**: App
   - **Gratis o de pago**: Gratis (monetización con compras dentro de la app)
   - **Declaraciones**:
     - ✅ Acepto directrices del desarrollador
     - ✅ Acepto leyes de exportación de EE.UU.
4. Click **"Crear app"**

### 4.2. Configurar Ficha de la Tienda

#### Detalles de la App

1. **Descripción breve** (máx. 80 caracteres):
   ```
   Mide tu felicidad diariamente y recibe consejos de IA para mejorarla
   ```

2. **Descripción completa** (máx. 4000 caracteres):
   ```
   🌟 Felizómetro - Tu Compañero de Felicidad Diaria

   ¿Alguna vez te has preguntado qué tan feliz eres realmente? Felizómetro te ayuda a medir, entender y mejorar tu bienestar emocional día a día.

   ✨ CARACTERÍSTICAS PRINCIPALES

   📊 Seguimiento Diario
   • Registra tu nivel de felicidad cada día del 1 al 10
   • Visualiza tu evolución en gráficos interactivos
   • Identifica patrones y tendencias en tu bienestar

   💬 Felizólogo Personal
   • Chat con inteligencia artificial especializada en bienestar
   • Recibe consejos personalizados basados en tus registros
   • 10 mensajes gratuitos al día + tokens adicionales disponibles

   📈 Análisis Inteligente
   • Insights automáticos sobre tu felicidad
   • Rachas de días consecutivos registrando
   • Estadísticas detalladas de tu bienestar

   🎯 Categorías de Felicidad
   • Organiza tus registros por áreas: trabajo, familia, salud, etc.
   • Identifica qué áreas necesitan más atención
   • Establecer metas específicas por categoría

   🌙 Modo Oscuro
   • Interfaz adaptativa para cuidar tus ojos
   • Cambio automático según preferencias del sistema

   🔒 PRIVACIDAD Y SEGURIDAD
   • Tus datos están seguros y encriptados
   • Sin publicidad molesta
   • Tu bienestar es privado

   💰 MODELO DE NEGOCIO TRANSPARENTE
   • Descarga gratuita
   • 10 mensajes diarios con el Felizólogo sin costo
   • Compra tokens para conversaciones ilimitadas
   • Precios desde 1.99€ (10 tokens)
   • Los tokens nunca caducan

   🧠 BASADO EN CIENCIA
   Felizómetro se basa en principios de psicología positiva y mindfulness para ayudarte a:
   • Aumentar tu autoconocimiento emocional
   • Desarrollar hábitos de reflexión diaria
   • Mejorar tu bienestar general

   📱 FÁCIL DE USAR
   • Interfaz intuitiva y atractiva
   • Registro en menos de 10 segundos
   • Sin complicaciones, solo enfócate en tu felicidad

   💪 PARA QUIÉN ES FELIZÓMETRO
   • Personas que buscan mejorar su bienestar
   • Quienes quieren entender mejor sus emociones
   • Usuarios de diarios y journals digitales
   • Practicantes de mindfulness y meditación
   • Cualquiera que quiera vivir más feliz

   🚀 COMIENZA HOY
   Descarga Felizómetro y empieza tu viaje hacia una vida más feliz y consciente.

   ¿Listo para medir tu felicidad? ¡Descarga ahora y descubre tu potencial de bienestar!
   ```

3. **Ícono de la app**: Sube `play_store_512.png`

4. **Gráfico de funciones**: Sube el gráfico 1024x500 que creaste

5. **Capturas de pantalla**: Sube al menos 2 (recomendado 4-6)

6. **Categoría**:
   - Primaria: **Salud y bienestar**
   - Secundaria: **Estilo de vida**

7. **Datos de contacto**:
   - Email: tu email
   - Sitio web: (opcional, puedes crear una página simple)
   - Teléfono: (opcional)

8. **Política de privacidad**: **OBLIGATORIO**
   - Necesitas crear una y subirla a una URL pública
   - Ver sección más abajo

---

## 📜 PASO 5: Documentos Legales Obligatorios

### 5.1. Política de Privacidad

**Obligatorio por ley (GDPR)**. Debe incluir:

```markdown
# Política de Privacidad de Felizómetro

Última actualización: [Fecha]

## 1. Información que Recopilamos
- Registros de felicidad (nivel del 1-10, notas, categorías)
- Identificador del dispositivo (anónimo)
- Mensajes enviados al Felizólogo IA
- Información de transacciones de pago (procesada por Stripe)

## 2. Cómo Usamos tu Información
- Para proporcionar y mejorar el servicio
- Para generar insights personalizados
- Para procesar pagos de manera segura
- Para responder a consultas de soporte

## 3. Compartir Información
NO vendemos ni compartimos tus datos personales con terceros.
Usamos servicios de terceros:
- Firebase (Google): Almacenamiento de datos
- Anthropic: Procesamiento de IA para el Felizólogo
- Stripe: Procesamiento de pagos

## 4. Seguridad de Datos
Implementamos medidas de seguridad para proteger tu información.
Datos encriptados en tránsito y en reposo.

## 5. Tus Derechos (GDPR)
Tienes derecho a:
- Acceder a tus datos
- Rectificar datos incorrectos
- Eliminar tu cuenta y datos
- Exportar tus datos
- Oponerte al procesamiento

## 6. Retención de Datos
Conservamos tus datos mientras uses la app o según requerimientos legales.

## 7. Contacto
Para consultas sobre privacidad: [tu email]

## 8. Cambios a esta Política
Te notificaremos de cambios significativos.
```

**Dónde alojar**:
- GitHub Pages (gratis)
- Google Sites (gratis)
- Tu propio dominio

**Ejemplo con GitHub Pages**:
1. Crea un repo público `felizometro-privacy`
2. Sube un archivo `index.html` con tu política
3. Activa GitHub Pages
4. URL: `https://[tu-usuario].github.io/felizometro-privacy`

### 5.2. Términos de Servicio

También recomendado (especialmente con pagos):

```markdown
# Términos de Servicio de Felizómetro

## 1. Aceptación de Términos
Al usar Felizómetro, aceptas estos términos.

## 2. Uso del Servicio
- Servicio para uso personal
- Prohibido uso ilegal o abusivo
- No garantizamos consejo médico profesional

## 3. Compras y Pagos
- Tokens para mensajes con el Felizólogo
- Los tokens nunca caducan
- Pagos procesados por Stripe
- Precios incluyen IVA español (21%)

## 4. Reembolsos
[Define tu política: ejemplo "Reembolsos dentro de 14 días si no usaste los tokens"]

## 5. Limitación de Responsabilidad
Felizómetro es una herramienta de bienestar, no sustituye atención médica profesional.

## 6. Cambios al Servicio
Podemos modificar o discontinuar características con previo aviso.

## 7. Ley Aplicable
Estos términos se rigen por las leyes de España.

## 8. Contacto
[Tu email]
```

---

## 📝 PASO 6: Completar Cuestionario de Contenido

Google te pedirá información sobre:

### 6.1. Clasificación de Contenido

Responde honestamente:
- **Violencia**: No
- **Contenido sexual**: No
- **Lenguaje inapropiado**: No
- **Drogas**: No (puede mencionar medicamentos en contexto de salud)
- **Discriminación**: No
- **etc.**

Tu app debería obtener clasificación **PEGI 3** o **Para todos**.

### 6.2. Segmentación de Contenido

- **Público objetivo**: Mayores de 13 años (por términos de uso de IA)
- **Interés de menores**: No específicamente
- **Funcionalidades para familias**: No

### 6.3. Declaración de Anuncios

- **¿Tu app muestra anuncios?**: No

### 6.4. Información sobre Privacidad

- **¿Accedes a datos sensibles?**: Sí (salud mental/bienestar)
- **¿Compartes datos con terceros?**: Sí (Firebase, Anthropic, Stripe)
- Link a política de privacidad

---

## 🔐 PASO 7: Configurar Compras Dentro de la App

### 7.1. Declaración de Pagos

1. En Play Console: **Monetización** → **Compras dentro de la app**
2. **¿Tu app ofrece compras?**: Sí
3. **Tipo**: Consumibles (tokens se consumen al usar)

### 7.2. Productos (No es necesario configurarlos aquí)

Como usas Stripe directamente (no Google Play Billing), solo necesitas:
- Declarar que hay compras
- No configurar productos SKU en Play Console
- Stripe maneja todo el proceso de pago

### 7.3. Alternativa: Implementar Google Play Billing (Opcional para el futuro)

Si quieres, en el futuro puedes migrar a Google Play Billing:
- Google se queda con 15-30% de comisión
- Mejor integración con Play Store
- Los usuarios pueden pagar con su cuenta de Google

---

## 📤 PASO 8: Subir el AAB

### 8.1. Crear Versión en Producción

1. Ve a **Producción** en el menú izquierdo
2. Click en **Crear nueva versión**
3. Sube tu archivo `.aab`
4. Completa:
   - **Nombre de versión**: 1.0.0
   - **Notas de la versión**:
     ```
     🎉 Lanzamiento inicial de Felizómetro

     ✨ Características:
     • Registro diario de felicidad
     • Gráficos de evolución
     • Chat con Felizólogo IA
     • Insights automáticos
     • Sistema de tokens
     • Modo oscuro

     ¡Comienza tu viaje hacia una vida más feliz!
     ```

### 8.2. Revisar y Lanzar

1. Revisa toda la información
2. Click en **"Revisar versión"**
3. Corrige cualquier error o advertencia
4. Click en **"Iniciar lanzamiento en producción"**

---

## ⏳ PASO 9: Proceso de Revisión

### 9.1. Tiempos

- **Revisión inicial**: 1-7 días (normalmente 2-3 días)
- **Revisiones posteriores**: Más rápidas

### 9.2. Qué Revisa Google

- Contenido de la app
- Funcionalidad básica
- Cumplimiento de políticas
- Metadatos y descripción
- Privacidad y seguridad

### 9.3. Posibles Rechazos

**Razones comunes**:
- Funcionalidad mínima: App crashea o no funciona
- Política de privacidad faltante o incorrecta
- Descripción engañosa
- Contenido inapropiado
- Permisos no justificados

**Si te rechazan**:
1. Lee cuidadosamente el motivo
2. Corrige el problema
3. Vuelve a enviar
4. Puedes apelar si crees que fue error

---

## ✅ PASO 10: ¡App Publicada!

### 10.1. Después de la Aprobación

Tu app estará disponible en Play Store en 1-2 horas.

**Link de tu app**:
```
https://play.google.com/store/apps/details?id=com.julio.felisometro
```

### 10.2. Primeras Acciones

1. **Comparte tu app**:
   - Redes sociales
   - Familia y amigos
   - Comunidades relacionadas

2. **Monitorea**:
   - Reseñas de usuarios
   - Informes de crasheos
   - Estadísticas de instalación

3. **Responde reseñas**:
   - Agradece feedback positivo
   - Resuelve problemas reportados

### 10.3. Promoción (Opcional)

- **ASO** (App Store Optimization):
  - Optimiza descripción con palabras clave
  - "felicidad", "bienestar", "diario emocional", "mindfulness"

- **Google Ads**:
  - Campañas de instalación de app
  - Segmenta por interés en salud mental/bienestar

---

## 🔄 PASO 11: Actualizaciones Futuras

### 11.1. Nuevas Versiones

Cada vez que actualices:
1. Incrementa `versionCode` en `app.json`
2. Actualiza `version` (ejemplo: 1.0.1, 1.1.0, 2.0.0)
3. Compila nuevo AAB
4. Sube a Play Console
5. Escribe notas de la versión

### 11.2. Staged Rollout (Recomendado)

En lugar de publicar al 100% de inmediato:
- Empieza con 5-10% de usuarios
- Monitorea errores
- Si todo bien, aumenta al 20%, 50%, 100%
- Si hay problemas, pausa el rollout

---

## 📊 PASO 12: Analíticas y Monetización

### 12.1. Vincular con Firebase Analytics

Ya tienes Firebase integrado. En Play Console:
1. **Configuración** → **Vínculos de API**
2. Vincula con tu proyecto de Firebase
3. Obtén analytics detallados

### 12.2. Monitorear Ingresos

- **Stripe Dashboard**: Ver pagos y transacciones
- **Firebase Firestore**: Ver tokens vendidos
- **Play Console**: Ver instalaciones y uso

### 12.3. Optimizar Conversión

Experimenta con:
- Precios de tokens
- Timing del paywall
- Mensajes de marketing
- Ofertas especiales

---

## 💰 PASO 13: Aspectos Fiscales en España

### 13.1. Declaración de Ingresos

Como autónomo o empresa en España:
- **IVA trimestral** (Modelo 303)
- **IVA anual** (Modelo 390)
- **IRPF** (Declaración de la renta)

### 13.2. Registros Contables

- Exporta transacciones desde Stripe
- Guarda facturas emitidas
- Registra en libro de ingresos

### 13.3. Asesor Fiscal

Recomiendo contratar un asesor que te ayude con:
- Declaraciones trimestrales/anuales
- Optimización fiscal
- Cumplimiento legal

---

## 🆘 Problemas Comunes

### Problema 1: Rechazo por "Funcionalidad Mínima"
**Solución**: Asegúrate que la app funcione completamente sin crasheos

### Problema 2: Política de Privacidad Incompleta
**Solución**: Usa el ejemplo de arriba, incluye todos los puntos requeridos

### Problema 3: Build Firma Inválida
**Solución**: EAS maneja las firmas automáticamente. Usa el mismo perfil siempre.

### Problema 4: App Tarda Mucho en Revisión
**Solución**: Paciencia. Puedes contactar soporte si pasan más de 7 días.

---

## 📚 Recursos Útiles

- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Políticas de Play Store**: https://play.google.com/about/developer-content-policy/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Stripe España**: https://stripe.com/es

---

## 🎉 ¡Felicitaciones!

Siguiendo esta guía, tu app Felizómetro estará publicada en Google Play Store y lista para empezar a generar ingresos.

**Próximos pasos**:
- ✅ Probar el sistema de pagos en producción
- ✅ Monitorear reseñas y feedback
- ✅ Iterar y mejorar basándote en datos de usuarios
- ✅ Celebrar tu lanzamiento 🎉

---

**¿Necesitas ayuda?** Consulta la documentación oficial o contacta soporte de Google Play Console.

**Última actualización**: 2024-12-03
