const functions = require("firebase-functions");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { log, error } = require("firebase-functions/logger");
const { defineString } = require("firebase-functions/params");
const axios = require("axios");
const cors = require("cors")({ origin: true });

// Initialize Firebase Admin SDK
initializeApp();

const googleMapsApiKey = defineString("GOOGLE_MAPS_API_KEY");
const STORE_ADDRESS = "Entre Rios 1581, W3400 Corrientes, Argentina";
const STORE_COLORS = {
    primary: '#0b369c',
    accent: '#ff8c34',
    text: '#333333',
    background: '#f4f4f4',
    white: '#ffffff'
};

// --- Reusable HTML Email Template ---
const createStyledEmail = (title, content) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: ${STORE_COLORS.background}; }
        .container { max-width: 600px; margin: 20px auto; background-color: ${STORE_COLORS.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background-color: ${STORE_COLORS.primary}; color: ${STORE_COLORS.white}; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; color: ${STORE_COLORS.text}; line-height: 1.6; }
        .content p { margin: 0 0 15px; }
        .footer { background-color: #f8f9fa; text-align: center; padding: 20px; font-size: 12px; color: #6c757d; }
        .button { display: inline-block; background-color: ${STORE_COLORS.accent}; color: ${STORE_COLORS.white}; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>Gracias por confiar en Cambacuá Vet.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};


// --- HTTP Request with CORS Middleware ---
exports.calculateDeliveryCost = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    if (request.method !== "POST") {
      return response.status(405).send("Method Not Allowed");
    }
    try {
      const destinationPlaceId = request.body.data.placeId;
      if (!destinationPlaceId) {
        error("Request body missing placeId");
        return response.status(400).json({ error: "La solicitud debe incluir un 'placeId'." });
      }
      log(`Calculating distance for placeId: ${destinationPlaceId}`);
      const GOOGLE_MAPS_API_KEY = googleMapsApiKey.value();
      const distanceMatrixUrl =
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(STORE_ADDRESS)}&destinations=place_id:${destinationPlaceId}&key=${GOOGLE_MAPS_API_KEY}&units=metric`;
      const mapsResponse = await axios.get(distanceMatrixUrl);
      const data = mapsResponse.data;
      if (data.status !== "OK" || data.rows[0].elements[0].status !== "OK") {
        error("Distance Matrix API Error:", data.error_message || data.status);
        return response.status(500).json({ error: "No se pudo calcular la distancia a esa ubicación." });
      }
      const distanceInKm = data.rows[0].elements[0].distance.value / 1000;
      const baseFee = 1600;
      const costPerExtraKm = 600;
      const finalCost = (distanceInKm <= 1) ? baseFee : baseFee + ((distanceInKm - 1) * costPerExtraKm);
      const roundedCost = Math.round(finalCost / 100) * 100;
      log(`Calculated cost: ${roundedCost} for distance: ${distanceInKm}km`);
      return response.status(200).json({ data: { cost: roundedCost } });
    } catch (err) {
      error("Internal function error:", err);
      return response.status(500).json({ error: "Ocurrió un error inesperado al calcular el costo." });
    }
  });
});


// --- Fires when a NEW order is created in 'pedidos' ---
exports.onordercreate = onDocumentCreated("pedidos/{pedidoId}", async (event) => {
    log("Function 'onordercreate' triggered for orderId:", event.params.pedidoId);
    const snapshot = event.data;
    if (!snapshot) {
        log("No data associated with the event on create. Exiting.");
        return;
    }
    const orderData = snapshot.data();
    const orderId = event.params.pedidoId;
    const customerEmail = orderData.email;
    const customerName = orderData.nombre || "Cliente";

    if (!customerEmail) {
        error("Could not find 'email' field in new order:", orderId);
        return;
    }

    if (orderData.programado) {
        log("Order is scheduled, skipping initial confirmation email for orderId:", orderId);
        return;
    }

    const emailSubject = `🎉 Tu pedido #${orderId} ha sido confirmado`;
    const emailContent = `
        <p>¡Hola ${customerName}!</p>
        <p>Hemos recibido y confirmado tu pedido <strong>#${orderId}</strong>.</p>
        <p>Te notificaremos nuevamente cuando el estado de tu pedido cambie.</p>
        <p>¡Gracias por elegirnos!</p>
    `;
    const emailHtml = createStyledEmail("Pedido Confirmado", emailContent);

    try {
        await getFirestore().collection("mail").add({
            to: [customerEmail],
            message: { subject: emailSubject, html: emailHtml },
        });
        log("Confirmation email document created successfully for:", customerEmail);
    } catch (err) {
        error("Error creating confirmation email document:", err);
    }
});

// --- Fires for status UPDATES within the 'pedidos' collection ---
exports.onorderstatusupdate = onDocumentUpdated("pedidos/{pedidoId}", async (event) => {
    log("Function 'onorderstatusupdate' triggered for orderId:", event.params.pedidoId);
    if (!event.data) { return; }
    
    const oldData = event.data.before.data();
    const newData = event.data.after.data();
    const orderId = event.params.pedidoId;

    if (newData.estado === oldData.estado) { return; }
    
    const customerEmail = newData.email;
    const customerName = newData.nombre || "Cliente";

    if (!customerEmail) { return; }

    let emailSubject = "";
    let emailTitle = "";
    let emailContent = "";

    switch (newData.estado) {
        case "Pendiente":
            if (oldData.estado === "Programado") {
                if (newData.metodoPago === "Transferencia Bancaria") {
                    emailTitle = "¡Vimos tu pedido!";
                    emailSubject = `👋 ¡Vimos tu pedido #${orderId}!`;
                    emailContent = `
                        <p>¡Hola ${customerName}!</p>
                        <p>Ya estamos en horario de atención y hemos visto tu pedido <strong>#${orderId}</strong>.</p>
                        <p>Estamos esperando la confirmación de tu pago para prepararlo. Una vez que lo recibamos, te notificaremos nuevamente.</p>
                        <p>¡Gracias por tu paciencia!</p>
                    `;
                } else {
                    emailTitle = "¡Pedido en preparación!";
                    emailSubject = `💪 ¡Ya estamos preparando tu pedido #${orderId}!`;
                    emailContent = `
                        <p>¡Hola ${customerName}!</p>
                        <p>Ya estamos en horario de atención y hemos comenzado a preparar tu pedido <strong>#${orderId}</strong>.</p>
                        <p>Te avisaremos cuando esté en camino.</p>
                        <p>¡Gracias por elegirnos!</p>
                    `;
                }
            }
            break;
        case "Pagado":
            emailTitle = "¡Pago Confirmado!";
            emailSubject = `✅ Tu pedido #${orderId} ha sido pagado`;
            emailContent = `<p>¡Hola ${customerName}!</p><p>Te confirmamos que hemos recibido el pago de tu pedido <strong>#${orderId}</strong>. Pronto comenzaremos a prepararlo.</p>`;
            break;
        default:
            return;
    }

    if (emailSubject) {
        const emailHtml = createStyledEmail(emailTitle, emailContent);
        try {
            await getFirestore().collection("mail").add({
                to: [customerEmail],
                message: { subject: emailSubject, html: emailHtml },
            });
            log("Status update email document created successfully for:", customerEmail);
        } catch (err) {
            error("Error creating status update email document:", err);
        }
    }
});


// --- Fires when a NEW order is created in 'pedidos_completados' ---
exports.onordercomplete = onDocumentCreated("pedidos_completados/{pedidoId}", async (event) => {
    log("Function 'onordercomplete' triggered for orderId:", event.params.pedidoId);
    const snapshot = event.data;
    if (!snapshot) { return; }
    
    const orderData = snapshot.data();
    const orderId = event.params.pedidoId;
    const customerEmail = orderData.email;
    const customerName = orderData.nombre || "Cliente";

    if (!customerEmail) { return; }

    let emailSubject = "";
    let emailTitle = "";
    let emailContent = "";

    if (orderData.estado === 'Completado') {
        emailTitle = "¡Pedido en Camino!";
        emailSubject = `🚚 ¡Tu pedido #${orderId} está en camino!`;
        emailContent = `
          <p>¡Hola ${customerName}!</p>
          <p><strong>¡Buenas noticias! El pedido ya salió para tu dirección y llegará en breve.</strong></p>
          <p>¡Gracias por tu compra!</p>
        `;
    } else if (orderData.estado === 'Cancelado') {
        emailTitle = "Pedido Cancelado";
        emailSubject = `❌ Tu pedido #${orderId} ha sido cancelado`;
        emailContent = `
          <p>¡Hola ${customerName}!</p>
          <p>Te confirmamos que tu pedido <strong>#${orderId}</strong> ha sido cancelado según tu solicitud.</p>
          <p>Si crees que esto es un error, por favor contáctanos.</p>
        `;
    } else {
        return;
    }

    const emailHtml = createStyledEmail(emailTitle, emailContent);
    try {
        await getFirestore().collection("mail").add({
            to: [customerEmail],
            message: { subject: emailSubject, html: emailHtml },
        });
        log("Completed/Sent email document created successfully for:", customerEmail);
    } catch (err) {
        error("Error creating completed/sent email document:", err);
    }
});
