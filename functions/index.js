const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {log, error} = require("firebase-functions/logger");

initializeApp();

// --- Function 1: Fires when a NEW order is created in 'pedidos' ---
exports.onordercreate = onDocumentCreated("pedidos/{pedidoId}", async (event) => {
    log("Function 'onordercreate' triggered for orderId:", event.params.pedidoId);
    const snapshot = event.data;
    if (!snapshot) {
        log("No data associated with the event on create. Exiting.");
        return;
    }
    const orderData = snapshot.data();
    const orderId = event.params.pedidoId;
    
    log("New order data:", orderData);

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

// --- Function 2: Fires for status UPDATES within the 'pedidos' collection ---
exports.onorderstatusupdate = onDocumentUpdated("pedidos/{pedidoId}", async (event) => {
    log("Function 'onorderstatusupdate' triggered for orderId:", event.params.pedidoId);
    if (!event.data) {
        log("No data associated with the update event. Exiting.");
        return;
    }
    const oldData = event.data.before.data();
    const newData = event.data.after.data();
    const orderId = event.params.pedidoId;

    if (newData.estado === oldData.estado) {
        log("Status not changed for order", orderId, "- not sending email.");
        return;
    }
    
    log("Order data updated. New data:", newData);

    const customerEmail = newData.email;
    const customerName = newData.nombre || "Cliente";

    if (!customerEmail) {
        error("Could not find 'email' field in updated order:", orderId);
        return;
    }

    let emailSubject = "";
    let emailHtml = "";

    switch (newData.estado) {
        case "Pagado":
            emailSubject = `✅ Tu pedido #${orderId} ha sido pagado`;
            emailHtml = `<p>¡Hola ${customerName}!</p><p>Te confirmamos que hemos recibido el pago de tu pedido <strong>#${orderId}</strong>. Pronto comenzaremos a prepararlo.</p>`;
            break;
        default:
            log("Status changed to", newData.estado, "- no email configured for this status in this function.");
            return;
    }

    try {
        await getFirestore().collection("mail").add({
            to: [customerEmail],
            message: {
                subject: emailSubject,
                html: emailHtml,
            },
        });
        log("Status update email document created successfully for:", customerEmail);
    } catch (err) {
        error("Error creating status update email document:", err);
    }
});


// --- Function 3: Fires when a NEW order is created in 'pedidos_completados' ---
exports.onordercomplete = onDocumentCreated("pedidos_completados/{pedidoId}", async (event) => {
    log("Function 'onordercomplete' triggered for orderId:", event.params.pedidoId);
    const snapshot = event.data;
    if (!snapshot) {
        log("No data associated with the 'completado' event. Exiting.");
        return;
    }
    const orderData = snapshot.data();
    const orderId = event.params.pedidoId;

    log("Completed order data:", orderData);
    
    const customerEmail = orderData.email;
    const customerName = orderData.nombre || "Cliente";

    if (!customerEmail) {
        error("Could not find 'email' field in completed order:", orderId);
        return;
    }

    const emailSubject = `🚚 ¡Tu pedido #${orderId} está en camino!`;
    const emailHtml = `
      <p>¡Hola ${customerName}!</p>
      <p><strong>El pedido ya salió para tu dirección! En breve llega.</strong></p>
      <p>¡Gracias por tu compra!</p>
    `;

    try {
        await getFirestore().collection("mail").add({
            to: [customerEmail],
            message: {
                subject: emailSubject,
                html: emailHtml,
            },
        });
        log("Completed/Sent email document created successfully for:", customerEmail);
    } catch (err) {
        error("Error creating completed/sent email document:", err);
    }
});
