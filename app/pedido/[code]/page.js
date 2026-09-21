"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

const STEPS = [
  { id: "nuevo", label: "Recibido", emoji: "🆕" },
  { id: "preparacion", label: "En preparación", emoji: "🍳" },
  { id: "listo", label: "Listo", emoji: "✅" },
  { id: "entregado", label: "Entregado", emoji: "📦" },
];

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