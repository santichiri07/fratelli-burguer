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

  const currentStepIndex = order ? STEPS.findIndex((s) => s.id === order.status) : -1;

  function sendToWhatsApp() {
    if (!order) return;

    const lines = (order.items || []).map((line) => {
      const notesPart = line.notes ? ` [${line.notes}]` : "";
      return `• ${line.qty}x ${line.name} (${line.variantLabel})${notesPart} - ${formatPrice(line.price * line.qty)}`;
    });

    const modeLabel = order.mode === "delivery" ? "Envío / Delivery" : "Retiro en el local";

    const message = [
      `¡Hola! Quiero hacer el pedido #${order.code}:`,
      "",
      `Modalidad: ${modeLabel}`,
      "",
      ...lines,
      "",
      `Total: ${formatPrice(order.total)}`,
      "",
      "Nombre:",
      order.mode === "delivery" ? "Dirección:" : null,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  }

  return (
    <div className="tracking-page">
      <div className="tracking-card">
        <h1 className="tracking-title">Pedido #{code}</h1>

        {loading && <p className="tracking-loading">Buscando tu pedido...</p>}

        {!loading && !order && (
          <p className="tracking-loading">No encontramos ese pedido.</p>
        )}

        {order && (
          <>
            <button className="tracking-whatsapp-btn" onClick={sendToWhatsApp}>
              💬 Enviar pedido por WhatsApp
            </button>

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