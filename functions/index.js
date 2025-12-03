const { onCall } = require('firebase-functions/v2/https');
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');
// IMPORTANTE: Configurar con: firebase functions:config:set stripe.secret_key="sk_test_..."
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'STRIPE_KEY_NOT_CONFIGURED');

admin.initializeApp();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

exports.chatFelizologo = onCall({ region: 'europe-west1' }, async (request) => {
  try {
    const { mensaje, historial, contextoUsuario } = request.data;

    if (!mensaje || typeof mensaje !== 'string') {
      throw new Error('Mensaje invalido');
    }

    const promptSistema = construirPromptPersonalizado(contextoUsuario);
    const mensajesParaClaude = prepararHistorial(historial);

    const respuesta = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: promptSistema,
      messages: [
        ...mensajesParaClaude,
        {
          role: 'user',
          content: mensaje
        }
      ]
    });

    const respuestaTexto = respuesta.content[0].text;
    const escrisis = detectarCrisis(mensaje);
    await registrarUso(contextoUsuario);

    return {
      respuesta: respuestaTexto,
      crisis: escrisis,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('Error en chatFelizologo:', error);
    throw new Error('Error al procesar el mensaje');
  }
});

function construirPromptPersonalizado(contexto) {
  const { mediaFelicidad, rachaActual, categoriasMasBajas, tendencia } = contexto || {};

  return `Eres un felizólogo empático, cálido y profesional especializado en bienestar emocional y psicología positiva.

CONTEXTO DEL USUARIO:
- Nivel de felicidad promedio: ${mediaFelicidad || 'No disponible'}/10
- Racha de registros diarios: ${rachaActual || 0} dias consecutivos
- Areas que necesitan mas atencion: ${categoriasMasBajas?.join(', ') || 'No especificadas'}
- Tendencia reciente: ${tendencia || 'Sin datos suficientes'}

TU ROL Y RESPONSABILIDADES:
1. Escuchar activamente y validar las emociones del usuario sin juzgar
2. Hacer preguntas abiertas y reflexivas que fomenten la autoexploracion
3. Ofrecer tecnicas practicas de CBT, Mindfulness y Psicologia positiva
4. Conectar las conversaciones con los datos de tracking de felicidad
5. Sugerir acciones concretas y alcanzables

ESTILO DE COMUNICACION:
- Calido, empatico pero profesional
- Respuestas de 2-4 parrafos cortos maximo
- Usa emojis ocasionalmente para calidez
- Termina con UNA pregunta reflexiva cuando sea apropiado
- Se conversacional, no academico

LIMITES IMPORTANTES:
- NUNCA diagnostiques trastornos mentales
- NUNCA recetes medicamentos
- Si detectas riesgo de autolesion o suicidio, recomienda ayuda profesional inmediata
- Si necesitan diagnostico medico, deriva a un doctor
- Manten el foco en bienestar emocional y desarrollo personal

RECUERDA:
- Eres un apoyo emocional, NO un terapeuta licenciado
- Tus respuestas deben empoderar, no crear dependencia
- Siempre fomenta el autocuidado y la busqueda de ayuda profesional cuando sea necesario`;
}

function prepararHistorial(historial) {
  if (!historial || historial.length === 0) return [];

  const mensajesFormateados = [];
  
  historial.forEach(msg => {
    if (msg.tipo === 'usuario') {
      mensajesFormateados.push({
        role: 'user',
        content: msg.texto
      });
    } else if (msg.tipo === 'ia') {
      mensajesFormateados.push({
        role: 'assistant',
        content: msg.texto
      });
    }
  });

  return mensajesFormateados.slice(-10);
}

function detectarCrisis(mensaje) {
  const palabrasCrisis = [
    'suicidio', 'suicidarme', 'matarme', 'matar me',
    'autolesion', 'auto lesion', 'cortarme', 'hacerme dano',
    'no quiero vivir', 'quiero morir', 'acabar con todo',
    'terminar con mi vida', 'mejor muerto', 'mejor muerta'
  ];

  const mensajeLower = mensaje.toLowerCase();
  return palabrasCrisis.some(palabra => mensajeLower.includes(palabra));
}

async function registrarUso(contexto) {
  try {
    const fecha = new Date().toISOString().split('T')[0];
    const statsRef = admin.firestore()
      .collection('stats')
      .doc('chat')
      .collection('daily')
      .doc(fecha);

    await statsRef.set({
      totalMensajes: admin.firestore.FieldValue.increment(1),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error registrando uso:', error);
  }
}

exports.verificarLimite = onCall({ region: 'europe-west1' }, async (request) => {
  try {
    const deviceId = request.data.deviceId;
    
    if (!deviceId) {
      throw new Error('Device ID requerido');
    }

    const hoy = new Date().toISOString().split('T')[0];
    const limiteRef = admin.firestore()
      .collection('limites')
      .doc(deviceId)
      .collection('daily')
      .doc(hoy);

    const doc = await limiteRef.get();
    const mensajesUsados = doc.exists ? (doc.data().mensajes || 0) : 0;
    const LIMITE_GRATIS = 10;

    return {
      mensajesUsados,
      mensajesRestantes: Math.max(0, LIMITE_GRATIS - mensajesUsados),
      limite: LIMITE_GRATIS,
      esPro: false
    };

  } catch (error) {
    console.error('Error verificando limite:', error);
    throw new Error('Error al verificar limite');
  }
});

exports.incrementarContador = onCall({ region: 'europe-west1' }, async (request) => {
  try {
    const deviceId = request.data.deviceId;

    if (!deviceId) {
      throw new Error('Device ID requerido');
    }

    const hoy = new Date().toISOString().split('T')[0];
    const limiteRef = admin.firestore()
      .collection('limites')
      .doc(deviceId)
      .collection('daily')
      .doc(hoy);

    await limiteRef.set({
      mensajes: admin.firestore.FieldValue.increment(1),
      ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true };

  } catch (error) {
    console.error('Error incrementando contador:', error);
    throw new Error('Error al incrementar contador');
  }
});

// Alias temporal para compatibilidad con APK antigua (versionCode 2)
// TODO: Eliminar cuando todos los usuarios usen versionCode 3+
exports.chatPsicologo = exports.chatFelizologo;

// ============================================
// FUNCIONES DE GESTIÓN DE TOKENS Y PAGOS
// ============================================

// Verificar tokens disponibles del usuario
exports.verificarTokens = onCall({ region: 'europe-west1' }, async (request) => {
  try {
    const { deviceId } = request.data;

    if (!deviceId) {
      throw new Error('Device ID requerido');
    }

    const tokensRef = admin.firestore()
      .collection('tokens')
      .doc(deviceId);

    const doc = await tokensRef.get();
    const tokens = doc.exists ? (doc.data().cantidad || 0) : 0;

    return {
      tokens,
      deviceId
    };

  } catch (error) {
    console.error('Error verificando tokens:', error);
    throw new Error('Error al verificar tokens');
  }
});

// Consumir un token (llamar antes de enviar mensaje)
exports.consumirToken = onCall({ region: 'europe-west1' }, async (request) => {
  try {
    const { deviceId } = request.data;

    if (!deviceId) {
      throw new Error('Device ID requerido');
    }

    const tokensRef = admin.firestore()
      .collection('tokens')
      .doc(deviceId);

    const doc = await tokensRef.get();
    const tokensActuales = doc.exists ? (doc.data().cantidad || 0) : 0;

    if (tokensActuales <= 0) {
      return {
        success: false,
        error: 'Sin tokens disponibles'
      };
    }

    // Decrementar token
    await tokensRef.set({
      cantidad: admin.firestore.FieldValue.increment(-1),
      ultimoUso: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      success: true,
      tokensRestantes: tokensActuales - 1
    };

  } catch (error) {
    console.error('Error consumiendo token:', error);
    throw new Error('Error al consumir token');
  }
});

// Añadir tokens al usuario (después de compra exitosa)
exports.agregarTokens = onCall({ region: 'europe-west1' }, async (request) => {
  try {
    const { deviceId, cantidad, pedidoId } = request.data;

    if (!deviceId || !cantidad) {
      throw new Error('Device ID y cantidad requeridos');
    }

    const tokensRef = admin.firestore()
      .collection('tokens')
      .doc(deviceId);

    await tokensRef.set({
      cantidad: admin.firestore.FieldValue.increment(cantidad),
      ultimaCompra: admin.firestore.FieldValue.serverTimestamp(),
      ultimoPedidoId: pedidoId || null
    }, { merge: true });

    // Registrar la transacción
    await admin.firestore()
      .collection('transacciones')
      .add({
        deviceId,
        cantidad,
        pedidoId,
        tipo: 'compra',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    const doc = await tokensRef.get();
    const tokensActuales = doc.data().cantidad;

    return {
      success: true,
      tokensActuales
    };

  } catch (error) {
    console.error('Error agregando tokens:', error);
    throw new Error('Error al agregar tokens');
  }
});

// Crear sesión de checkout de Stripe
exports.crearCheckoutStripe = onCall({ region: 'europe-west1' }, async (request) => {
  try {
    const { deviceId, paqueteId, tokens, precio } = request.data;

    if (!deviceId || !paqueteId || !tokens || !precio) {
      throw new Error('Faltan parámetros requeridos');
    }

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${tokens} Tokens para Felizómetro`,
              description: `${tokens} mensajes con el Felizólogo IA`,
              images: ['https://felizometro.app/icon.png'], // Cambia por tu URL real
            },
            unit_amount: Math.round(precio * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://felizometro.app/pago-exitoso?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://felizometro.app/pago-cancelado',
      metadata: {
        deviceId,
        paqueteId,
        tokens: tokens.toString(),
      },
      tax_id_collection: {
        enabled: true, // Permite recopilar NIF/CIF para facturación
      },
      billing_address_collection: 'required',
      customer_email: null, // Opcional: puedes pedirlo en la app
    });

    // Guardar sesión pendiente en Firestore
    await admin.firestore()
      .collection('pagos_pendientes')
      .doc(session.id)
      .set({
        deviceId,
        paqueteId,
        tokens,
        precio,
        sessionId: session.id,
        estado: 'pendiente',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    return {
      url: session.url,
      sessionId: session.id
    };

  } catch (error) {
    console.error('Error creando checkout:', error);
    throw new Error('Error al crear sesión de pago');
  }
});

// Webhook de Stripe para procesar pagos completados
exports.stripeWebhook = onRequest({ region: 'europe-west1' }, async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Error verificando webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const { deviceId, tokens } = session.metadata;

    // Agregar tokens al usuario
    const tokensRef = admin.firestore()
      .collection('tokens')
      .doc(deviceId);

    await tokensRef.set({
      cantidad: admin.firestore.FieldValue.increment(parseInt(tokens)),
      ultimaCompra: admin.firestore.FieldValue.serverTimestamp(),
      ultimoPedidoId: session.id
    }, { merge: true });

    // Actualizar estado del pago
    await admin.firestore()
      .collection('pagos_pendientes')
      .doc(session.id)
      .update({
        estado: 'completado',
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // Registrar transacción
    await admin.firestore()
      .collection('transacciones')
      .add({
        deviceId,
        cantidad: parseInt(tokens),
        pedidoId: session.id,
        tipo: 'compra',
        precio: session.amount_total / 100,
        moneda: session.currency,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    console.log(`Tokens agregados exitosamente para ${deviceId}: ${tokens} tokens`);
  }

  res.json({ received: true });
});

// Canjear código de compra de Stripe Payment Link
exports.canjearCodigoCompra = onCall({ region: 'europe-west1' }, async (request) => {
  try {
    const { deviceId, codigoCompra } = request.data;

    if (!deviceId || !codigoCompra) {
      throw new Error('Device ID y código de compra requeridos');
    }

    // Verificar si el código ya fue usado
    const codigoRef = admin.firestore()
      .collection('codigos_canjeados')
      .doc(codigoCompra);

    const codigoDoc = await codigoRef.get();

    if (codigoDoc.exists) {
      return {
        success: false,
        error: 'Este código ya ha sido canjeado anteriormente'
      };
    }

    // Buscar el pago en Stripe usando el Payment Intent ID
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(codigoCompra);
    } catch (error) {
      console.error('Error buscando pago en Stripe:', error);
      return {
        success: false,
        error: 'Código inválido. Verifica que copiaste correctamente el código del email.'
      };
    }

    // Verificar que el pago esté completado
    if (paymentIntent.status !== 'succeeded') {
      return {
        success: false,
        error: 'El pago no ha sido completado aún'
      };
    }

    // Determinar cuántos tokens corresponden según el monto pagado
    const montoPagado = paymentIntent.amount / 100; // Stripe usa centavos
    let tokensAAsignar = 0;

    // Mapeo de precios a tokens (con IVA incluido)
    if (montoPagado >= 2.40 && montoPagado <= 2.50) {
      tokensAAsignar = 10;
    } else if (montoPagado >= 9.60 && montoPagado <= 9.70) {
      tokensAAsignar = 50;
    } else if (montoPagado >= 15.70 && montoPagado <= 15.80) {
      tokensAAsignar = 100;
    } else if (montoPagado >= 30.20 && montoPagado <= 30.30) {
      tokensAAsignar = 250;
    } else {
      return {
        success: false,
        error: `Monto no reconocido: ${montoPagado}€. Contacta con soporte.`
      };
    }

    // Agregar tokens al usuario
    const tokensRef = admin.firestore()
      .collection('tokens')
      .doc(deviceId);

    await tokensRef.set({
      cantidad: admin.firestore.FieldValue.increment(tokensAAsignar),
      ultimaCompra: admin.firestore.FieldValue.serverTimestamp(),
      ultimoPedidoId: codigoCompra
    }, { merge: true });

    // Marcar el código como usado
    await codigoRef.set({
      deviceId,
      tokens: tokensAAsignar,
      montoPagado,
      fechaCanje: admin.firestore.FieldValue.serverTimestamp(),
      paymentIntentId: codigoCompra
    });

    // Registrar la transacción
    await admin.firestore()
      .collection('transacciones')
      .add({
        deviceId,
        cantidad: tokensAAsignar,
        pedidoId: codigoCompra,
        tipo: 'canje_manual',
        precio: montoPagado,
        moneda: paymentIntent.currency,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    // Obtener total de tokens
    const doc = await tokensRef.get();
    const tokensActuales = doc.exists ? doc.data().cantidad : tokensAAsignar;

    console.log(`Código canjeado exitosamente - Device: ${deviceId}, Tokens: ${tokensAAsignar}`);

    return {
      success: true,
      tokensAñadidos: tokensAAsignar,
      tokensActuales
    };

  } catch (error) {
    console.error('Error canjeando código:', error);
    throw new Error('Error al canjear el código de compra');
  }
});