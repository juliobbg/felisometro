# 🧪 Guía de Prueba: Sistema de Pagos Felizómetro

## 📱 APK Disponible

Tu nueva versión (versionCode 3) está lista:
**Descargar**: https://expo.dev/accounts/juliobbg/projects/felisometro/builds/5be08068-ec06-4ecb-bf45-b642ebb3df48

---

## 🎯 Objetivo de la Prueba

Vamos a probar el flujo completo de compra y canje de tokens usando **tarjetas de prueba** de Stripe.

---

## 🔧 Preparativos

### 1. Instalar el APK
- Abre el link del APK en tu dispositivo Android
- Instala la aplicación
- **IMPORTANTE**: Si ya tienes una versión instalada, desinstálala primero

### 2. Preparar Tarjeta de Prueba

```
Número: 4242 4242 4242 4242
Fecha: 12/25 (cualquier fecha futura)
CVC: 123 (cualquier 3 dígitos)
Nombre: Tu Nombre
Código Postal: 28001 (cualquiera)
```

---

## 📝 Pasos de Prueba

### PARTE 1: Agotar el Límite Gratuito

1. **Abre la app** recién instalada
2. **Completa el onboarding** si aparece
3. **Ve a la pestaña "Felizólogo"** (el chat con IA)
4. **Envía 10 mensajes** cualesquiera, por ejemplo:
   - "Hola"
   - "¿Cómo estás?"
   - "Cuéntame un chiste"
   - etc...

5. **Al enviar el mensaje 11**, debería aparecer un modal que dice:
   ```
   💬 Límite Alcanzado
   Has alcanzado el límite diario de 10 mensajes gratuitos.

   Compra tokens para continuar conversando:
   • 1 token = 1 mensaje
   • Los tokens nunca caducan
   • Pago único, sin suscripción
   • Desde 1.99€ (10 tokens)
   ```

6. **Haz click en "Comprar Tokens"**

---

### PARTE 2: Pantalla de Compra

Deberías ver la pantalla de **Comprar Tokens** con:

- **Header**: "Comprar Tokens"
- **Saldo actual**: 0 tokens
- **4 paquetes**:
  - 10 tokens - 2.41€
  - 50 tokens - 9.67€ ⭐ MÁS POPULAR
  - 100 tokens - 15.72€
  - 250 tokens - 30.24€

**Verifica que**:
- Los precios se ven correctamente
- El badge "MÁS POPULAR" está en 50 tokens
- Los badges de ahorro están visibles
- Hay información sobre IVA incluido

---

### PARTE 3: Proceso de Pago

1. **Selecciona el paquete de 10 tokens** (2.41€)

2. Se abrirá el navegador con la página de pago de Stripe

3. **Completa el formulario**:
   - Email: tu email real (recibirás el recibo aquí)
   - Nombre de tarjeta: Tu nombre
   - Número de tarjeta: `4242 4242 4242 4242`
   - Fecha: `12/25`
   - CVC: `123`
   - Código postal: `28001`
   - País: España

4. **Marca** "Guardar mi información para pagos futuros" (opcional)

5. **Click en "Pagar 2.41€"**

6. El pago se procesará y verás un mensaje de confirmación

---

### PARTE 4: Recibir el Código

1. **Revisa tu email** (el que usaste en el pago)

2. Deberías recibir un email de Stripe con el asunto:
   ```
   Receipt from Stripe [felisometro]
   ```

3. **Abre el email** y busca el **código de pago**

4. El código tiene este formato:
   ```
   Payment Intent ID: pi_3AbcDef123GhiJkl456MnoPqr
   ```

5. **Copia el código completo** (empieza con `pi_`)

---

### PARTE 5: Canjear el Código

1. **Vuelve a la app** Felizómetro

2. Si cerraste la pantalla de compra, ve de nuevo a:
   - Felizólogo → Enviar mensaje (se bloqueará)
   - Click "Comprar Tokens"

3. **Click en el botón "Restaurar Compras"**

4. Se abrirá un modal que dice:
   ```
   Canjear Código de Compra
   Introduce el código que recibiste en tu email de Stripe
   ```

5. **Pega el código** que copiaste (el que empieza con `pi_`)

6. **Click en "Canjear"**

7. Verás un loading spinner

8. **Después de 1-2 segundos**, debería aparecer:
   ```
   ✅ ¡Tokens Añadidos!
   Se han añadido 10 tokens a tu cuenta.

   Total actual: 10 tokens
   ```

9. **Verifica** que el saldo en la pantalla ahora muestra "10 tokens"

---

### PARTE 6: Usar los Tokens

1. **Vuelve a la pestaña del Felizólogo**

2. El header ahora debería mostrar:
   - **Icono de corona dorada** 👑
   - **Badge "PRO"** en color dorado
   - **"10 tokens"** en lugar del contador "X / 10"

3. **Envía un nuevo mensaje** al Felizólogo

4. El mensaje debería enviarse correctamente

5. **Verifica** que el contador de tokens disminuyó a **"9 tokens"**

6. **Envía más mensajes** y verifica que:
   - Cada mensaje consume 1 token
   - El contador disminuye correctamente
   - Los mensajes se envían sin problemas

---

## ✅ Checklist de Verificación

Marca cada item después de probarlo:

- [ ] Modal de límite aparece después de 10 mensajes
- [ ] Navegación a pantalla de compra funciona
- [ ] 4 paquetes se muestran correctamente
- [ ] Precios con IVA son correctos
- [ ] Botón de compra abre Stripe
- [ ] Pago con tarjeta de prueba funciona
- [ ] Email de Stripe recibido
- [ ] Código `pi_...` encontrado en email
- [ ] Modal de canje se abre correctamente
- [ ] Código se canjea exitosamente
- [ ] Tokens se añaden al saldo
- [ ] Badge PRO aparece en header
- [ ] Mensajes consumen tokens correctamente
- [ ] Contador de tokens disminuye

---

## 🐛 Posibles Problemas y Soluciones

### Problema 1: "No se pudo abrir la página de pago"
**Solución**: Verifica tu conexión a internet

### Problema 2: "Código inválido"
**Solución**:
- Verifica que copiaste el código completo
- Debe empezar con `pi_`
- No debe tener espacios al inicio/final

### Problema 3: "Este código ya ha sido canjeado"
**Solución**: Cada código solo se puede usar una vez. Haz otra compra de prueba.

### Problema 4: No recibo el email de Stripe
**Solución**:
- Revisa tu carpeta de spam
- Espera 1-2 minutos
- Verifica que ingresaste el email correctamente

### Problema 5: Los tokens no se restan al enviar mensaje
**Solución**:
- Cierra y abre la app
- Verifica que el badge PRO aparece
- Contacta si el problema persiste

---

## 📊 Verificar en Stripe Dashboard

Para ver la transacción en tu panel de Stripe:

1. Ve a: https://dashboard.stripe.com/test/payments
2. Deberías ver tu pago de 2.41€
3. Click en el pago para ver detalles
4. Verifica:
   - Estado: "Succeeded" ✅
   - Monto: 2.41 EUR
   - Payment Intent ID: el código que usaste

---

## 🔐 Verificar en Firebase Console

Para ver los tokens en tu base de datos:

1. Ve a: https://console.firebase.google.com/project/felisometro/firestore
2. Ve a la colección **"tokens"**
3. Busca tu documento (por deviceId)
4. Deberías ver:
   ```
   cantidad: 10 (o el número actual)
   ultimaCompra: timestamp
   ultimoPedidoId: pi_...
   ```

5. Ve a la colección **"transacciones"**
6. Deberías ver un registro con:
   ```
   cantidad: 10
   precio: 2.41
   tipo: "canje_manual"
   moneda: "eur"
   ```

---

## 📸 Capturas Recomendadas

Si quieres documentar tu prueba, toma capturas de:

1. Modal de límite alcanzado
2. Pantalla de compra de tokens
3. Página de pago de Stripe
4. Email con el código
5. Modal de canje exitoso
6. Header con badge PRO y tokens
7. Contador de tokens disminuyendo

---

## 🎉 Si Todo Funciona

¡Felicidades! Tu sistema de pagos está completamente funcional.

### Próximos pasos:
1. ✅ Completar verificación de Stripe
2. ✅ Cambiar a claves de producción (`sk_live_`)
3. ✅ Añadir Política de Privacidad
4. ✅ Publicar en Google Play Store
5. ✅ ¡Empezar a ganar dinero! 💰

---

## 🆘 Si Algo No Funciona

Reporta el problema incluyendo:
- **Paso exacto** donde falló
- **Mensaje de error** (si hay)
- **Capturas de pantalla**
- **Logs** de la consola (si es posible)

---

**¡Buena suerte con la prueba! 🚀**

Última actualización: 2024-12-03
