# 🔧 Configuración Rápida de Stripe

## Paso 1: Obtener tu Secret Key de Stripe

1. Ve a: https://dashboard.stripe.com/test/apikeys
2. Inicia sesión en tu cuenta de Stripe
3. En la sección "Standard keys", busca **"Secret key"**
4. Haz click en "Reveal test key" si está oculta
5. Copia la clave completa (empieza con `sk_test_...`)

## Paso 2: Configurar la Clave en Firebase

Abre tu terminal y ejecuta:

```bash
cd c:\Users\julio\Desktop\webs\felisometro\felisometro

firebase functions:config:set stripe.secret_key="sk_test_TU_CLAVE_AQUI"
```

## Paso 3: Desplegar las Funciones

```bash
cd functions
npm run deploy
```

## Paso 4: Verificar que Todo Funciona

Después del despliegue, verás un mensaje como:

```
✔  Deploy complete!
```

## ⚠️ Estado Actual

- ✅ API Key de Anthropic: **CONFIGURADA**
- ❌ Secret Key de Stripe: **PENDIENTE**

Una vez configures Stripe, podrás:
- Procesar pagos reales
- Canjear códigos de compra
- Añadir tokens a los usuarios

## 🔒 Seguridad

**IMPORTANTE**: Nunca compartas tu Secret Key públicamente. Esta clave te permite:
- Crear pagos
- Reembolsar transacciones
- Acceder a información de clientes

---

**Siguiente paso**: Obtén tu Secret Key de Stripe y configúrala con el comando de arriba.
