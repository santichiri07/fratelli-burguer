"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/* =========================================================
   ACÁ PONÉS LA CONTRASEÑA DEL PANEL
   (elegí una que solo sepa el jefe/encargado)
   ========================================================= */
const ADMIN_PASSWORD = "cambiaresto123";

const STATUS_OPTIONS = [
  { id: "nuevo", label: "🆕 Nuevo" },
  { id: "preparacion", label: "🍳 En preparación" },
  { id: "listo", label: "✅ Listo" },
  { id: "entregado", label: "📦 Entregado" },
];

function formatPrice(n) {
  return Number(n).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function Panel() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState({ count: 0, total: 0 });
  const [showArchived, setShowArchived] = useState(false);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Recordar sesión mientras el navegador esté abierto */
  useEffect(() => {
    if (sessionStorage.getItem("panel-unlocked") === "true") {
      setUnlocked(true);
    }
  }, []);

  function tryUnlock(e) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setUnlocked(true);
      sessionStorage.setItem("panel-unlocked", "true");
    } else {
      alert("Contraseña incorrecta");
    }
  }

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("archived", false)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  }

  async function loadSales() {
    const { data, error } = await supabase
      .from("orders")
      .select("total")
      .eq("archived", true)
      .gte("created_at", startOfTodayISO());

    if (!error && data) {
      const total = data.reduce((sum, o) => sum + Number(o.total), 0);
      setSales({ count: data.length, total });
    }
  }

  async function loadArchived() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("archived", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) setArchivedOrders(data);
  }

  async function unarchiveOrder(orderId) {
    await supabase.from("orders").update({ archived: false }).eq("id", orderId);
    setArchivedOrders((prev) => prev.filter((o) => o.id !== orderId));
    refreshAll();
  }

  async function refreshAll() {
    await loadOrders();
    await loadSales();
  }

  /* Cargar pedidos al entrar, y actualizar solos cada 15 segundos */
  useEffect(() => {
    if (!unlocked) return;
    refreshAll();
    const interval = setInterval(refreshAll, 15000);
    return () => clearInterval(interval);
  }, [unlocked]);

  async function updateStatus(orderId, newStatus) {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  }

  async function archiveOrder(orderId) {
    await supabase.from("orders").update({ archived: true }).eq("id", orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    loadSales();
  }

  async function deleteOrder(orderId) {
    const confirmado = window.confirm(
      "¿Seguro que querés eliminar este pedido? Esta acción no se puede deshacer."
    );
    if (!confirmado) return;

    await supabase.from("orders").delete().eq("id", orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setArchivedOrders((prev) => prev.filter((o) => o.id !== orderId));
  }

  if (!unlocked) {
    return (
      <div className="panel-login">
        <form onSubmit={tryUnlock} className="panel-login-box">
          <h1>Panel de pedidos</h1>
          <input
            type="password"
            placeholder="Contraseña"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            autoFocus
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="panel-page">
      <header className="panel-header">
        <h1>Panel de pedidos</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="panel-refresh" onClick={refreshAll}>
            🔄 Actualizar
          </button>
          <button
            className="panel-refresh"
            onClick={() => {
              const next = !showArchived;
              setShowArchived(next);
              if (next) loadArchived();
            }}
          >
            {showArchived ? "Ver pedidos activos" : "📁 Ver archivados"}
          </button>
        </div>
      </header>

      <div className="panel-sales-bar">
        💰 Ventas de hoy: <strong>{sales.count}</strong> pedidos — <strong>{formatPrice(sales.total)}</strong>
      </div>

      {showArchived ? (
        <>
          {archivedOrders.length === 0 && (
            <p className="panel-empty">No hay pedidos archivados.</p>
          )}
          <div className="panel-orders">
            {archivedOrders.map((order) => (
              <div className="panel-order-card" key={order.id}>
                <div className="panel-order-top">
                  <span className="panel-order-code">Pedido #{order.code}</span>
                  <span className="panel-order-date">{formatDate(order.created_at)}</span>
                  <span className={`panel-order-mode ${order.mode}`}>
                    {order.mode === "delivery" ? "🛵 Delivery" : "🏠 Take Away"}
                  </span>
                </div>

                {order.mode === "delivery" && order.delivery_address && (
                  <div className="panel-delivery-info">
                    <p className="panel-delivery-address">{order.delivery_address}</p>
                    {order.delivery_lat !== null && order.delivery_lng !== null && (
                      <a
                        className="panel-map-btn"
                        href={`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🗺️ Ver en mapa
                      </a>
                    )}
                  </div>
                )}

                <ul className="panel-order-items">
                  {(order.items || []).map((line, idx) => (
                    <li key={idx}>
                      {line.qty}x {line.name} ({line.variantLabel})
                    </li>
                  ))}
                </ul>

                <div className="panel-order-total">Total: {formatPrice(order.total)}</div>

                <div className="panel-actions-row">
                  <button className="panel-refresh" onClick={() => unarchiveOrder(order.id)}>
                    ↩️ Desarchivar
                  </button>
                  <button className="panel-delete-btn" onClick={() => deleteOrder(order.id)}>
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {loading && <p className="panel-empty">Cargando pedidos...</p>}
          {!loading && orders.length === 0 && (
            <p className="panel-empty">No hay pedidos activos.</p>
          )}

          <div className="panel-orders">
            {orders.map((order) => (
              <div className="panel-order-card" key={order.id}>
                <div className="panel-order-top">
                  <span className="panel-order-code">Pedido #{order.code}</span>
                  <span className="panel-order-date">{formatDate(order.created_at)}</span>
                  <span className={`panel-order-mode ${order.mode}`}>
                    {order.mode === "delivery" ? "🛵 Delivery" : "🏠 Take Away"}
                  </span>
                </div>

                {order.mode === "delivery" && order.delivery_address && (
                  <div className="panel-delivery-info">
                    <p className="panel-delivery-address">{order.delivery_address}</p>
                    {order.delivery_lat !== null && order.delivery_lng !== null && (
                      <a
                        className="panel-map-btn"
                        href={`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🗺️ Ver en mapa
                      </a>
                    )}
                  </div>
                )}

                <ul className="panel-order-items">
                  {(order.items || []).map((line, idx) => (
                    <li key={idx}>
                      {line.qty}x {line.name} ({line.variantLabel})
                      {line.notes && <span className="panel-order-notes"> — {line.notes}</span>}
                    </li>
                  ))}
                </ul>

                <div className="panel-order-total">Total: {formatPrice(order.total)}</div>

                <div className="panel-status-row">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      className={`panel-status-btn ${order.status === opt.id ? "active" : ""}`}
                      onClick={() => updateStatus(order.id, opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="panel-actions-row">
                  {order.status === "entregado" && (
                    <button className="panel-archive-btn" onClick={() => archiveOrder(order.id)}>
                      ✔️ Archivar y sumar a ventas del día
                    </button>
                  )}
                  <button className="panel-delete-btn" onClick={() => deleteOrder(order.id)}>
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}