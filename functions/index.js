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

// --- FINAL, CORRECTED FUNCTION: HTTP Request with CORS Middleware ---
exports.calculateDeliveryCost = functions.https.onRequest((request, response) => {
  // Use the cors middleware to automatically handle the OPTIONS preflight request
  // and add the 'Access-Control-Allow-Origin' header to our response.
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
      const costPerExtraKm = 700;
      const finalCost = (distanceInKm <= 1) ? baseFee : baseFee + ((distanceInKm - 1) * costPerExtraKm);
      const roundedCost = Math.round(finalCost / 100) * 100;

      log(`Calculated cost: ${roundedCost} for distance: ${distanceInKm}km`);
      // Send the successful response back to the client.
      return response.status(200).json({ data: { cost: roundedCost } });

    } catch (err) {
      error("Internal function error:", err);
      return response.status(500).json({ error: "Ocurrió un error inesperado al calcular el costo." });
    }
  });
});


// --- Your existing function 1: Fires when a NEW order is created in 'pedidos' ---
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

    const emailSubject = `🎉 Tu pedido #${orderId} ha sido confirmado`;
    const emailHtml = `
      <p>¡Hola ${customerName}!</p>
      <p>Hemos recibido y confirmado tu pedido <strong>#${orderId}</strong>.</p>
      <p>Te notificaremos nuevamente cuando el estado de tu pedido cambie.</p>
      <p>¡Gracias por elegirnos!</p>
    `;

    try {
        await getFirestore().collection("mail").add({
            to: [customerEmail],
            message: {
                subject: emailSubject,
                html: emailHtml,
            },
        });
        log("Confirmation email document created successfully for:", customerEmail);
    } catch (err) {
        error("Error creating confirmation email document:", err);
    }
});

// --- Your existing function 2: Fires for status UPDATES within the 'pedidos' collection ---
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
    let emailHtml = "";

    switch (newData.estado) {
        case "Pagado":
            emailSubject = `✅ Tu pedido #${orderId} ha sido pagado`;
            emailHtml = `<p>¡Hola ${customerName}!</p><p>Te confirmamos que hemos recibido el pago de tu pedido <strong>#${orderId}</strong>. Pronto comenzaremos a prepararlo.</p>`;
            break;
        default:
            return;
    }

    try {
        await getFirestore().collection("mail").add({
            to: [customerEmail],
            message: { subject: emailSubject, html: emailHtml },
        });
        log("Status update email document created successfully for:", customerEmail);
    } catch (err) {
        error("Error creating status update email document:", err);
    }
});


// --- Your existing function 3: Fires when a NEW order is created in 'pedidos_completados' ---
exports.onordercomplete = onDocumentCreated("pedidos_completados/{pedidoId}", async (event) => {
    log("Function 'onordercomplete' triggered for orderId:", event.params.pedidoId);
    const snapshot = event.data;
    if (!snapshot) { return; }
    
    const orderData = snapshot.data();
    const orderId = event.params.pedidoId;
    const customerEmail = orderData.email;
    const customerName = orderData.nombre || "Cliente";

    if (!customerEmail) { return; }

    const emailSubject = `🚚 ¡Tu pedido #${orderId} está en camino!`;
    const emailHtml = `
      <p>¡Hola ${customerName}!</p>
      <p><strong>El pedido ya salió para tu dirección! En breve llega.</strong></p>
      <p>¡Gracias por tu compra!</p>
    `;

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
