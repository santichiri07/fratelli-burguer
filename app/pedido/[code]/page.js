"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

/* Mismo número que en app/page.js. Si lo cambiás ahí, cambialo acá también. */
const WHATSAPP_NUMBER = "5492216166846";

const STEPS = [
  { id: "nuevo", label: "Recibido", emoji: "🆕" },
  { id: "preparacion", label: "En preparación", emoji: "🍳" },
  { id: "listo", label: "Listo", emoji: "✅" },
  { id: "entregado", label: "Entregado", emoji: "📦" },
];

function formatPrice(n) {
  return Number(n).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

export default function SeguimientoPedido() {
  const params = useParams();
  const code = params.code;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadOrder() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("code", code)
      .single();

    if (data) setOrder(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 5000);
    return () => clearInterval(interval);
  }, [code]);

  // Si el pedido ya fue entregado, redirigir a home y limpiar localStorage
  useEffect(() => {
    if (order && order.status === "entregado") {
      localStorage.removeItem("fb_last_order_code");
      window.location.href = "/";
    }
  }, [order]);

  const currentStepIndex = order ? STEPS.findIndex((s) => s.id === order.status) : -1;
  const currentStatusLabel = currentStepIndex >= 0 ? STEPS[currentStepIndex].label : "Recibido";

  function sendToWhatsApp() {
    if (!order) return;

    const lines = (order.items || []).map((line) => {
      const notesPart = line.notes ? ` [${line.notes}]` : "";
      return `• ${line.qty}x ${line.name} (${line.variantLabel})${notesPart} - ${formatPrice(line.price * line.qty)}`;
    });

    const modeLabel = order.mode === "delivery" ? "Envío / Delivery" : "Retiro en el local";

    const messageParts = [
      `¡Hola! Quiero hacer el pedido #${order.code}:`,
      "",
      `Modalidad: ${modeLabel}`,
      "",
      ...lines,
      "",
      `Total: ${formatPrice(order.total)}`,
      "",
      "Nombre:",
    ];

    if (order.mode === "delivery" && order.delivery_address) {
      messageParts.push("Dirección:", order.delivery_address);
      if (order.delivery_lat !== null && order.delivery_lng !== null) {
        messageParts.push(`Ver en mapa: https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`);
      }
    }

    const message = messageParts.filter(Boolean).join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  }

  return (
    <div className="tracking-page">
      <div className="tracking-card">
        <h1 className="tracking-title">Pedido #{code}</h1>

        {loading && (
  <div className="terminal-loader">
    <div className="terminal-header">
      <div className="terminal-title">Buscando pedido</div>
      <div className="terminal-controls">
        <div className="control close"></div>
        <div className="control minimize"></div>
        <div className="control maximize"></div>
      </div>
    </div>
    <div className="text">Cargando...</div>
  </div>
)}

        {!loading && !order && (
          <p className="tracking-loading">No encontramos ese pedido.</p>
        )}

{order && (
          <>
           <button className="tracking-whatsapp-btn" onClick={sendToWhatsApp}>
             💬 Enviar pedido por WhatsApp
           </button>

          <div className="tracking-payment-note">
            <strong>💳 Pago:</strong> Enviá el comprobante al alias <strong>oziel.a</strong> a nombre de <strong>Oziel Nicolás Acosta</strong>
          </div>

          {order.mode === "delivery" && order.delivery_address && (
            <div className="tracking-delivery-info">
              <h3>📍 Dirección de entrega</h3>
              <p className="delivery-address">{order.delivery_address}</p>
              {order.delivery_lat !== null && order.delivery_lng !== null && (
                <a
                  className="delivery-map-link"
                  href={`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🗺️ Ver en Google Maps
                </a>
              )}
            </div>
          )}

 <div className="terminal-loader" key={currentStatusLabel}>
  <div className="terminal-header">
    <div className="terminal-title">Estado</div>
    <div className="terminal-controls">
      <div className="control close"></div>
      <div className="control minimize"></div>
      <div className="control maximize"></div>
    </div>
  </div>
  <div
    className="text"
    style={{ "--term-width": `${currentStatusLabel.length * 0.62}em` }}
  >
    {currentStatusLabel}
  </div>
</div>

<div className="tracking-steps">
              {STEPS.map((step, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div className="tracking-step" key={step.id}>
                    <div
                      className={`tracking-dot ${isDone ? "done" : ""} ${
                        isCurrent ? "current" : ""
                      }`}
                    >
                      {isDone ? "✔" : step.emoji}
                    </div>
                    <span className="tracking-label">{step.label}</span>
                    {idx < STEPS.length - 1 && (
                      <div className={`tracking-line ${isDone ? "done" : ""}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <p className="tracking-note">
              Esta página se actualiza sola. Podés cerrarla y volver a abrir este
              mismo link cuando quieras para ver el estado de tu pedido.
            </p>
          </>
        )}
      </div>
    </div>
  );
}