const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {log, error} = require("firebase-functions/logger");

initializeApp();

// --- Function 1: Fires when a NEW order is created ---
exports.onordercreate = onDocumentCreated("pedidos/{pedidoId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        log("No data associated with the event");
        return;
    }
    const orderData = snapshot.data();
    const orderId = event.params.pedidoId;

    const customerEmail = orderData.email;
    if (!customerEmail) {
        error("No email found for new order:", orderId);
        return;
    }

    const emailSubject = `🎉 Tu pedido #${orderId} ha sido confirmado`;
    const emailText = `¡Hola ${orderData.nombre}! Hemos recibido y confirmado tu pedido. Te notificaremos nuevamente cuando el estado de tu pedido cambie. Puedes ver el resumen de tu compra en cualquier momento.`;
    const emailHtml = `
      <p>¡Hola ${orderData.nombre}!</p>
      <p>Hemos recibido y confirmado tu pedido <strong>#${orderId}</strong>.</p>
      <p>Te notificaremos nuevamente cuando el estado de tu pedido cambie.</p>
      <p>Puedes ver el resumen de tu compra en cualquier momento.</p>
      <p>¡Gracias por elegirnos!</p>
    `;

    try {
        await getFirestore().collection("mail").add({
            to: [customerEmail],
            message: {
                subject: emailSubject,
                text: emailText,
                html: emailHtml,
            },
        });
        log("Confirmation email document created successfully for:", customerEmail);
    } catch (err) {
        error("Error creating confirmation email document:", err);
    }
});

// --- Function 2: Fires when an EXISTING order is updated ---
exports.onorderstatusupdate = onDocumentUpdated("pedidos/{pedidoId}", async (event) => {
    if (!event.data) {
        log("No data associated with the event");
        return;
    }
    const oldData = event.data.before.data();
    const newData = event.data.after.data();
    const orderId = event.params.pedidoId;

    if (newData.estado === oldData.estado) {
        log("Status not changed for order", orderId, "- not sending email.");
        return;
    }

    const customerEmail = newData.email;
    if (!customerEmail) {
        error("No email found for updated order:", orderId);
        return;
    }

    let emailSubject = "";
    let emailHtml = "";

    switch (newData.estado) {
        case "Pagado":
            emailSubject = `✅ Tu pedido #${orderId} ha sido pagado`;
            emailHtml = `<p>¡Hola ${newData.nombre}!</p><p>Te confirmamos que hemos recibido el pago de tu pedido <strong>#${orderId}</strong>. Pronto comenzaremos a prepararlo.</p>`;
            break;
        case "Enviado":
            emailSubject = `🚚 Tu pedido #${orderId} está en camino`;
            emailHtml = `<p>¡Hola ${newData.nombre}!</p><p>Tu pedido <strong>#${orderId}</strong> ya fue despachado y está en camino a tu domicilio.</p>`;
            break;
        case "Completado":
            emailSubject = `🎉 Tu pedido #${orderId} ha sido completado`;
            emailHtml = `<p>¡Hola ${newData.nombre}!</p><p>Esperamos que disfrutes tu compra. ¡Gracias por elegirnos!</p>`;
            break;
        default:
            log("Status changed to", newData.estado, "- no email configured for this status.");
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
