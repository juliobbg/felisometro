# 🔐 URGENTE: Seguridad de API Keys

## ⚠️ PROBLEMA ACTUAL

Tus claves API están **hardcodeadas** en el código. Esto es un **riesgo de seguridad crítico**:

1. **API Key de Anthropic**: Visible en `functions/index.js`
2. **Secret Key de Stripe**: Visible en `functions/index.js`

Si alguien accede a tu código, puede:
- ❌ Usar tu API de Anthropic y gastarte dinero
- ❌ Acceder a información de pagos de Stripe
- ❌ Manipular transacciones

## 🛠️ SOLUCIÓN: Variables de Entorno

### Paso 1: Configurar Variables en Firebase

Abre tu terminal y ejecuta estos comandos:

```bash
# Navegar al directorio del proyecto
cd c:\Users\julio\Desktop\webs\felisometro\felisometro

# Configurar API Key de Anthropic (CÁMBIALA por una nueva)
firebase functions:config:set anthropic.key="sk-ant-api03-NUEVA_KEY_AQUI"

# Configurar Stripe Secret Key (la que obtuviste del Dashboard)
firebase functions:config:set stripe.secret_key="sk_test_TU_CLAVE_AQUI"

# Ver configuración actual (para verificar)
firebase functions:config:get
```

### Paso 2: Actualizar el Código

El código ya está preparado para leer de variables de entorno:

```javascript
// En functions/index.js ya tienes:
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
```

### Paso 3: Eliminar las Claves Hardcodeadas

**IMPORTANTE**: Después de configurar las variables de entorno, debes:

1. Eliminar las claves del código
2. Hacer commit de los cambios
3. Redesplegar las functions

```bash
# Redesplegar functions con las nuevas variables
cd functions
npm run deploy
```

### Paso 4: Generar Nueva API Key de Anthropic

**¡MUY IMPORTANTE!**: Como tu clave actual está expuesta, debes:

1. Ir a [Anthropic Console](https://console.anthropic.com/settings/keys)
2. **Eliminar** la API key actual
3. Crear una **nueva** API key
4. Configurarla con: `firebase functions:config:set anthropic.key="nueva_key"`

## 🔒 Buenas Prácticas de Seguridad

### ✅ Hacer:
- Usar variables de entorno para todas las claves
- Rotar (cambiar) las API keys periódicamente
- Usar claves diferentes para desarrollo y producción
- Mantener `.env` en `.gitignore`

### ❌ NO Hacer:
- Hardcodear claves en el código
- Compartir claves en mensajes o emails
- Commitear archivos `.env` a Git
- Usar las mismas claves en producción y desarrollo

## 📋 Checklist de Seguridad

Antes de lanzar a producción:

- [ ] API Key de Anthropic configurada en Firebase
- [ ] Secret Key de Stripe configurada en Firebase
- [ ] Claves hardcodeadas eliminadas del código
- [ ] Nueva API Key de Anthropic generada
- [ ] Functions redespliegadas
- [ ] Verificado que todo funciona con las nuevas claves
- [ ] Claves de producción (sk_live_) configuradas antes del lanzamiento

## 🚨 Si Crees que tu Clave fue Comprometida

1. **Inmediatamente** elimina la clave en Anthropic Console
2. **Genera** una nueva clave
3. **Configúrala** en Firebase
4. **Redesplegar** functions
5. **Monitorea** tu uso en el dashboard de Anthropic

## 📞 Enlaces Útiles

- [Anthropic Console - API Keys](https://console.anthropic.com/settings/keys)
- [Stripe Dashboard - API Keys](https://dashboard.stripe.com/test/apikeys)
- [Firebase Functions Config](https://firebase.google.com/docs/functions/config-env)

---

**¡La seguridad es crítica! No pospongas estos pasos.**
