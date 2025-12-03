# 🔐 Configuración de Sistema de Pagos - Felizómetro

## ⚠️ IMPORTANTE - SEGURIDAD

**URGENTE**: Tu API key de Anthropic está actualmente hardcodeada en el código. **Debes cambiarla inmediatamente** y configurar variables de entorno.

## 📋 Requisitos Previos

### 1. Cuenta de Stripe
- Crea una cuenta en [Stripe](https://dashboard.stripe.com/register)
- Como resides en España, Stripe soporta completamente pagos con IVA español (21%)
- Configura tu perfil de negocio en Stripe Dashboard

### 2. Alta como Autónomo o Empresa
Para vender servicios digitales en España necesitas:
- **Autónomo**: Darte de alta en Hacienda y Seguridad Social
- **Empresa**: Constituir una SL (Sociedad Limitada)
- **NIF/CIF**: Necesario para facturación
- **IVA**: Declaraciones trimestrales (Modelo 303) y anuales (Modelo 390)

## 🔧 Configuración de Firebase Functions

### Paso 1: Configurar Variables de Entorno

```bash
# Ir al directorio de functions
cd functions

# Configurar API Key de Anthropic (¡CÁMBIALA!)
firebase functions:config:set anthropic.key="tu-nueva-api-key-de-anthropic"

# Configurar Stripe Secret Key (obtener de Stripe Dashboard)
firebase functions:config:set stripe.secret_key="sk_live_tu_clave_secreta"

# Configurar Stripe Webhook Secret (después de crear webhook)
firebase functions:config:set stripe.webhook_secret="whsec_tu_webhook_secret"
```

### Paso 2: Actualizar index.js para usar variables de entorno

Las claves ya están configuradas para leer de variables de entorno:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
```

### Paso 3: Desplegar Functions

```bash
cd functions
npm run deploy
```

## 🔗 Configuración de Stripe

### 1. Obtener API Keys

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navega a **Developers** > **API keys**
3. Copia tu **Secret key** (empieza con `sk_test_` para pruebas o `sk_live_` para producción)

### 2. Configurar Webhooks

Los webhooks permiten que Stripe notifique a tu app cuando se completa un pago.

1. Ve a **Developers** > **Webhooks**
2. Click en **Add endpoint**
3. URL del endpoint: `https://europe-west1-felisometro.cloudfunctions.net/stripeWebhook`
4. Eventos a escuchar:
   - `checkout.session.completed`
5. Copia el **Signing secret** (empieza con `whsec_`)
6. Configúralo con: `firebase functions:config:set stripe.webhook_secret="whsec_..."`

### 3. Configurar Facturación Automática

En Stripe Dashboard:
1. Ve a **Settings** > **Tax settings**
2. Activa **Tax calculation**
3. Configura España con IVA del 21%
4. Activa **Automatic tax** para calcular IVA automáticamente

### 4. Configurar Productos (Opcional)

En lugar de crear precios dinámicamente, puedes crear productos fijos:
1. Ve a **Products** > **Add product**
2. Crea cada paquete de tokens:
   - 10 tokens - 1.99€
   - 50 tokens - 7.99€
   - 100 tokens - 12.99€
   - 250 tokens - 24.99€

## 💶 Configuración Fiscal Española

### IVA (21%)

El sistema ya incluye IVA automáticamente:
```javascript
const IVA = 0.21; // 21% IVA español
const precioConIVA = precioBase * (1 + IVA);
```

### Facturación Electrónica

Stripe genera facturas automáticamente si configuras:
1. **Settings** > **Invoicing**
2. Activa **Custom invoice branding**
3. Añade tu logo y datos fiscales:
   - Nombre de tu empresa/nombre comercial
   - NIF/CIF
   - Dirección fiscal
   - Datos de contacto

### Obligaciones Fiscales

Como vendedor en España, debes:

1. **Modelo 303 (Trimestral)**
   - Declaración del IVA
   - Plazos: 20 de abril, julio, octubre, enero

2. **Modelo 390 (Anual)**
   - Resumen anual del IVA
   - Plazo: hasta 31 de enero

3. **IRPF (Anual)**
   - Declaración de la renta
   - Incluye ingresos por la app

4. **Libros de registro**
   - Mantén registro de todas las transacciones
   - Stripe proporciona informes exportables

## 🧪 Modo de Prueba (Testing)

### Usar tarjetas de prueba de Stripe:

- **Pago exitoso**: `4242 4242 4242 4242`
- **Pago rechazado**: `4000 0000 0000 0002`
- **Requiere autenticación**: `4000 0027 6000 3184`
- Fecha: Cualquier fecha futura
- CVC: Cualquier 3 dígitos
- Código postal: Cualquiera

### Probar webhooks localmente:

```bash
# Instalar Stripe CLI
# Visita: https://stripe.com/docs/stripe-cli

# Escuchar webhooks localmente
stripe listen --forward-to http://localhost:5001/felisometro/europe-west1/stripeWebhook

# Disparar evento de prueba
stripe trigger checkout.session.completed
```

## 🚀 Pasar a Producción

### 1. Activar cuenta de Stripe

1. Completa el proceso de verificación en Stripe Dashboard
2. Proporciona:
   - Documento de identidad
   - Datos fiscales (NIF/CIF)
   - Cuenta bancaria para recibir pagos
   - Información del negocio

### 2. Cambiar a claves de producción

```bash
# Configurar clave de producción
firebase functions:config:set stripe.secret_key="sk_live_tu_clave_de_produccion"

# Redeploy
cd functions && npm run deploy
```

### 3. Actualizar URLs en la app

En `ComprarTokensScreen.tsx` y `functions/index.js`, cambia:
- URLs de éxito/cancelación a tu dominio real
- URL de imagen del producto

### 4. Configurar dominio propio (Recomendado)

Para las URLs de éxito/cancelación, considera:
1. Registrar un dominio: `felizometro.app`
2. Crear páginas web simples para:
   - `/pago-exitoso` - Confirma la compra
   - `/pago-cancelado` - Explica qué pasó

## 📊 Monitoreo y Análisis

### Dashboard de Stripe
- **Payments**: Ver todas las transacciones
- **Balance**: Dinero disponible y pendiente
- **Reports**: Exportar datos para contabilidad

### Firebase Console
- **Firestore**: Ver tokens de usuarios en colección `tokens`
- **Functions**: Logs de las funciones
- **Analytics**: Uso de la app

### Alertas Importantes

Configura alertas en Stripe para:
- Pagos fallidos
- Disputas (chargebacks)
- Límites de facturación alcanzados

## 🔒 Seguridad y Cumplimiento

### GDPR (Reglamento Europeo)

Debes cumplir con GDPR:
1. **Política de Privacidad**: Explica qué datos recopilas
2. **Términos de Servicio**: Condiciones de uso
3. **Consentimiento**: Usuario acepta antes de pagar
4. **Derecho al olvido**: Permite eliminar datos

### PCI DSS

Stripe se encarga de PCI DSS - **NUNCA** almacenes:
- Números de tarjeta
- CVV/CVC
- Datos de pago completos

### Datos Sensibles

- **DeviceId**: Anonimizado, no identifica personas
- **Tokens**: No son datos personales
- **Transacciones**: Almacena solo info necesaria para soporte

## 💡 Recomendaciones Adicionales

### 1. Sistema de Referidos (Futuro)
Considera añadir referidos: "Invita a un amigo y gana 5 tokens"

### 2. Promociones y Descuentos
Stripe soporta cupones de descuento:
```javascript
coupon: 'PROMO10' // 10% de descuento
```

### 3. Análisis de Conversión
Monitorea:
- ¿Cuántos usuarios llegan a la pantalla de compra?
- ¿Cuántos completan el pago?
- ¿Qué paquete es más popular?

### 4. Emails Transaccionales
Stripe envía emails automáticamente, pero puedes personalizarlos

### 5. Soporte al Cliente
Prepara respuestas para:
- "No recibí mis tokens" → Verificar en Firebase
- "El pago falló" → Ver logs de Stripe
- "Quiero reembolso" → Política de reembolso clara

## ❓ Preguntas Frecuentes

**Q: ¿Cuánto cobra Stripe por transacción?**
A: 1.4% + 0.25€ por transacción exitosa con tarjetas europeas

**Q: ¿Cuándo recibo el dinero?**
A: Stripe hace pagos cada 7 días por defecto (configurable)

**Q: ¿Necesito SSL/HTTPS?**
A: Sí, Stripe requiere HTTPS - Firebase Functions ya lo proporciona

**Q: ¿Qué pasa si un usuario hace chargeback?**
A: Stripe te notifica y cobran una comisión (15€). Puedes disputarlo.

**Q: ¿Puedo aceptar otras monedas?**
A: Sí, cambia `currency: 'eur'` a `'usd'`, `'gbp'`, etc.

## 📞 Soporte

- **Stripe**: https://support.stripe.com/
- **Firebase**: https://firebase.google.com/support
- **Hacienda España**: https://sede.agenciatributaria.gob.es/
- **Autónomos**: https://www.seg-social.es/

## 🚨 Checklist Final Antes de Lanzar

- [ ] Cambiar API key de Anthropic
- [ ] Configurar Stripe keys en Firebase
- [ ] Activar cuenta de Stripe (verificación completada)
- [ ] Configurar webhooks en producción
- [ ] Añadir Política de Privacidad
- [ ] Añadir Términos de Servicio
- [ ] Probar flujo completo de pago
- [ ] Configurar facturación automática con IVA
- [ ] Alta en Hacienda (autónomo/empresa)
- [ ] Configurar alertas de monitoreo
- [ ] Preparar soporte al cliente
- [ ] Definir política de reembolsos

---

**¡Éxito con tu app! 🚀**
