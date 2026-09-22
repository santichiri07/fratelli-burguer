"use client";

import { useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image"
/* =========================================================
   1) ACÁ EDITO EL MENÚ
   Cada producto tiene "variants": las opciones con su precio.
   Para agregar/sacar hamburguesas.
   ========================================================= */
const CATEGORIES = [
  {
    id: "hamburguesas",
    label: "🍔 Hamburguesas",
    title: "BURGERS",
    desc: "Amasamos el mejor pan de papa que vas a probar. Ahumamos nuestra panceta con madera de manzano.",
    image: "/cat-burgers.jpg",
  },
  {
    id: "combos",
    label: "🍟 Combos",
    title: "COMBOS",
    desc: "Tu hamburguesa favorita con papas y bebida, todo junto y más conveniente.",
    image: "/cat-combos.jpg",
  },
   /* bebidas desactivadas temporalmente!
   {
    id: "bebidas",
    label: "🥤 Bebidas",
    title: "BEBIDAS",
    desc: "Cervezas, gaseosas línea Pepsi y agua bien fría.",
    image: "/cat-bebidas.jpg",
  },
    */
  {
    id: "extras",
    label: "➕ Extras",
    title: "SIDES",
    desc: "Elegí entre nuestra variedad de acompañamientos: papas fritas y más.",
    image: "/cat-sides.jpg",
  },
];

const REMOVALS = [
  { id: "sin-lechuga", label: "Sin lechuga" },
  { id: "sin-tomate", label: "Sin tomate" },
  { id: "sin-cheddar", label: "Sin cheddar" },
  { id: "sin-cebolla", label: "Sin cebolla" },
];

const EXTRAS = [
  { id: "extra-cheddar", label: "Extra cheddar", price: 1000 },
  { id: "extra-bacon", label: "Extra bacon", price: 1500 },
  { id: "extra-carne", label: "Extra carne", price: 2500 },
  { id: "salsa-extra", label: "Salsa adicional", price: 500 },
];

const MENU = [
  {
    id: "cheese",
    category: "hamburguesas",
    customizable: true,
    name: "Burger Cheese",
    desc: "Nuestra clásica, con doble cheddar fundido.",
    variants: [
      { id: "simple", label: "Simple", price: 7000 },
      { id: "doble", label: "Doble", price: 9000 },
    ],
  },
  {
    id: "completa",
    category: "hamburguesas",
    customizable: true,
    name: "Burguer Completa",
    desc: "Lechuga, tomate, jamón y queso.",
    variants: [
      { id: "simple", label: "Simple", price: 10000 },
      { id: "doble", label: "Doble", price: 12000 },
    ],
  },
  {
    id: "veggie",
    category: "hamburguesas",
    customizable: true,
    name: "Burguer Veggie",
    desc: "Opción sin carne, mismo sabor de siempre.",
    variants: [
      { id: "simple", label: "Simple", price: 8000 },
      { id: "doble", label: "Doble", price: 10000 },
    ],
  },
  {
    id: "papas-sobre",
    name: "Sobre de Papas",
    category: "extras",
    desc: "Porción individual.",
    variants: [
      { id: "sazonadas", label: "Sazonadas", price: 2000 },
      { id: "sin-sazonar", label: "Sin sazonar", price: 2000 },
    ],
  },
  {
    id: "papas-fuente",
    category: "extras",
    name: "Fuentecita de Papas",
    desc: "Para compartir.",
    variants: [
      { id: "sazonadas", label: "Sazonada", price: 4000 },
      { id: "sin-sazonar", label: "Sin sazonar", price: 4000 },
    ],
  },
  {
    id: "combo-cheese",
    category: "combos",
    name: "Combo Cheese",
    desc: "Burger Cheese + papas + gaseosa.",
    variants: [{ id: "unico", label: "Único", price: 12000 }],
  },
  {
    id: "coca",
    category: "bebidas",
    name: "Gaseosa línea Coca-Cola",
    desc: "500ml.",
    variants: [{ id: "unico", label: "Única", price: 2500 }],
  },
  {
    id: "sprite",
    category: "bebidas",
    name: "Gaseosa línea Sprite",
    desc: "500ml.",
    variants: [{ id: "unico", label: "Única", price: 2500 }],
  },
  {
    id: "fanta",
    category: "bebidas",
    name: "Gaseosa línea Fanta",
    desc: "500ml.",
    variants: [{ id: "unico", label: "Única", price: 2500 }],
  },
  {
    id: "agua-saborizada",
    category: "bebidas",
    name: "Agua saborizada línea Aquarius",
    desc: "500ml. Elegí su sabor!",
    variants: [
      { id: "sabor-pera", label: "Pera", price: 2500 },
      { id: "sabor-uva", label: "Uva", price: 2500 },
      { id: "sabor-manzana", label: "Manzana", price: 2500 },
      { id: "sabor-pomelo", label: "Pomelo", price: 2500 },
      { id: "sabor-naranja", label: "Naranja", price: 2500 },
    ],
  },
];

/* =========================================================
   2) ACÁ PONÉS TU NÚMERO DE WHATSAPP
   Formato: código de país + código de área + número, sin
   espacios ni el "+". Ejemplo Argentina (La Plata):
   549221XXXXXXX
   ========================================================= */
const WHATSAPP_NUMBER = "5492216166846";

function formatPrice(n) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default function Home() {
  const [orderMode, setOrderMode] = useState(null); // "takeaway" | "delivery" | null
  const [viewingCategory, setViewingCategory] = useState(null); // id de categoría o null (portada)
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customization, setCustomization] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(
    Object.fromEntries(MENU.map((item) => [item.id, item.variants[0].id]))
  );

  function goToCategory(categoryId) {
    setViewingCategory(categoryId);
  }

  function chooseVariant(itemId, variantId) {
    setSelectedVariant((prev) => ({ ...prev, [itemId]: variantId }));
  }

  function getItemCustomization(itemId) {
    return customization[itemId] || { removals: [], extras: [] };
  }

  function toggleRemoval(itemId, removalId) {
    const current = getItemCustomization(itemId);
    const removals = current.removals.includes(removalId)
      ? current.removals.filter((r) => r !== removalId)
      : [...current.removals, removalId];
    setCustomization((prev) => ({ ...prev, [itemId]: { ...current, removals } }));
  }

  function toggleExtra(itemId, extraId) {
    const current = getItemCustomization(itemId);
    const extras = current.extras.includes(extraId)
      ? current.extras.filter((e) => e !== extraId)
      : [...current.extras, extraId];
    setCustomization((prev) => ({ ...prev, [itemId]: { ...current, extras } }));
  }

  function addToCart(item) {
    const variantId = selectedVariant[item.id];
    const variant = item.variants.find((v) => v.id === variantId);

    let extraPrice = 0;
    let notesParts = [];

    if (item.customizable) {
      const custom = getItemCustomization(item.id);

      custom.removals.forEach((rId) => {
        const removal = REMOVALS.find((r) => r.id === rId);
        if (removal) notesParts.push(removal.label);
      });

      custom.extras.forEach((eId) => {
        const extra = EXTRAS.find((e) => e.id === eId);
        if (extra) {
          notesParts.push(extra.label);
          extraPrice += extra.price;
        }
      });
    }

    const notes = notesParts.join(", ");
    const cartLineId = `${item.id}-${variant.id}-${notes}`;

    setCart((prev) => {
      const existing = prev.find((line) => line.cartLineId === cartLineId);
      if (existing) {
        return prev.map((line) =>
          line.cartLineId === cartLineId ? { ...line, qty: line.qty + 1 } : line
        );
      }
      return [
        ...prev,
        {
          cartLineId,
          name: item.name,
          variantLabel: variant.label,
          notes,
          price: variant.price + extraPrice,
          qty: 1,
        },
      ];
    });
    setCartOpen(true);
  }

  function changeQty(cartLineId, delta) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.cartLineId === cartLineId ? { ...line, qty: line.qty + delta } : line
        )
        .filter((line) => line.qty > 0)
    );
  }

  function removeLine(cartLineId) {
    setCart((prev) => prev.filter((line) => line.cartLineId !== cartLineId));
  }

  const total = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.qty, 0),
    [cart]
  );
  const itemCount = useMemo(() => cart.reduce((sum, line) => sum + line.qty, 0), [cart]);

  const visibleItems = useMemo(
    () => MENU.filter((item) => item.category === viewingCategory),
    [viewingCategory]
  );

  const currentCategory = CATEGORIES.find((c) => c.id === viewingCategory);

async function checkoutOnWhatsApp() {
  if (cart.length === 0) return;
  const orderCode = String(Math.floor(1000 + Math.random() * 9000));
  const lines = cart.map((line) => {
    const notesPart = line.notes ? ` [${line.notes}]` : "";
    return `• ${line.qty}x ${line.name} (${line.variantLabel})${notesPart} - ${formatPrice(line.price * line.qty)}`;
  });

  const modeLabel = orderMode === "delivery" ? "Envío / Delivery" : "Retiro en el local";

  const message = [
  `¡Hola! Quiero hacer el pedido #${orderCode}:`,
  "",
    `Modalidad: ${modeLabel}`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`,
    "",
    "Nombre:",
    orderMode === "delivery" ? "Dirección:" : null,
  ]
    .filter(Boolean)
    .join("\n");

  /* Guardamos el pedido en Supabase. Si falla, igual dejamos
     que el cliente pueda mandar el WhatsApp (no lo bloqueamos). */
  try {
   await supabase.from("orders").insert({
  mode: orderMode,
  items: cart,
  total: total,
  code: orderCode,
});
  } catch (err) {
    console.error("No se pudo guardar el pedido en la base:", err);
  }

window.location.href = `/pedido/${orderCode}`;
}
  

  const cartWidget = (
    <>
      <button className="cart-fab" onClick={() => setCartOpen(true)}>
        🛒 Ver pedido
        {itemCount > 0 && <span className="count">{itemCount}</span>}
      </button>

      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-header">
              <button className="ticket-close" onClick={() => setCartOpen(false)}>
                ✕
              </button>
              <h2>Tu pedido</h2>
              <p>Comanda #{Math.floor(Math.random() * 900 + 100)}</p>
            </div>

            <div className="ticket-items">
              {cart.length === 0 && <p className="ticket-empty">Todavía no agregaste nada.</p>}
              {cart.map((line) => (
                <div className="ticket-line" key={line.cartLineId}>
                  <div>
                    <div>
                      {line.name} — {line.variantLabel}
                      {line.notes && <div style={{ fontSize: 11, color: "#6b5a48" }}>{line.notes}</div>}
                    </div>
                    <div className="qty-controls">
                      <button onClick={() => changeQty(line.cartLineId, -1)}>-</button>
                      <span>{line.qty}</span>
                      <button onClick={() => changeQty(line.cartLineId, 1)}>+</button>
                      <button className="remove" onClick={() => removeLine(line.cartLineId)}>
                        quitar
                      </button>
                    </div>
                  </div>
                  <div>{formatPrice(line.price * line.qty)}</div>
                </div>
              ))}
            </div>

            <div className="ticket-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <div className="ticket-footer">
              <button className="whatsapp-btn" onClick={checkoutOnWhatsApp} disabled={cart.length === 0}>
                Enviar pedido por WhatsApp
              </button>
              <p className="ticket-note">
                Se abre WhatsApp con tu pedido ya armado. Completás nombre y dirección ahí.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  /* PANTALLA 1: elegir Take Away o Delivery */
  if (!orderMode) {
    return (
      <div className="mode-screen">
        <Image src="/logo.png" alt="Fratelli Burger" width={140} height={140} className="logo-img" />
        <h1 className="mode-title">
          fratelli <span>burger</span>
        </h1>
        <p className="mode-subtitle">¿Cómo querés tu pedido?</p>
        <div className="mode-buttons">
          <button className="mode-btn" onClick={() => setOrderMode("takeaway")}>
            🏠 Take Away
          </button>
          <button className="mode-btn" onClick={() => setOrderMode("delivery")}>
            🛵 Delivery
          </button>
        </div>
      </div>
    );
  }

  /* PANTALLA 2: portada con las tarjetas grandes de categoría */
  if (!viewingCategory) {
    return (
      <>
        <header className="hero">
          <Image src="/logo.png" alt="Cheese Burger" width={140} height={140} className="logo-img" />
          <span className="badge" onClick={() => setOrderMode(null)} style={{ cursor: "pointer" }}>
            {orderMode === "delivery" ? "🛵 Delivery" : "🏠 Take Away"} · cambiar
          </span>
          <h1>
            fratelli <span>burger</span>
          </h1>
          <p>Elegí tus favoritas, armá el pedido y coordinalo por WhatsApp en segundos.</p>
        </header>

        <section className="menu-bg">
          <main className="menu">
            <h2 className="menu-title">Menú</h2>

            <div className="category-cards">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="category-card"
                  style={{ backgroundImage: `url(${cat.image})`, cursor: "pointer" }}
                  onClick={() => goToCategory(cat.id)}
                >
                  <div className="category-card-inner">
                    <h3 className="category-card-title">{cat.title}</h3>
                    <p className="category-card-desc">{cat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </section>

        {cartWidget}
      </>
    );
  }

  /* PANTALLA 3: página completa de la categoría elegida, con sus productos */
  return (
    <>
      <header className="hero" style={{ padding: "32px 24px" }}>
        <button
          onClick={() => setViewingCategory(null)}
          style={{
            background: "none",
            border: "none",
            color: "var(--cheese)",
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 12,
            cursor: "pointer",
          }}
        >
          ← Volver a categorías
        </button>
        <h1>{currentCategory?.title}</h1>
        <p>{currentCategory?.desc}</p>
      </header>

      <section className="menu-bg">
        <main className="menu">
          <div className="menu-grid">
            {visibleItems.map((item) => (
              <div className="item-card" key={item.id}>
                <h3>{item.name}</h3>
                <p className="desc">{item.desc}</p>

                <div className="variant-row">
                  {item.variants.map((variant) => {
                    const isSelected = selectedVariant[item.id] === variant.id;
                    return (
                      <label
                        key={variant.id}
                        className={`variant-option ${isSelected ? "selected" : ""}`}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="radio"
                            name={`variant-${item.id}`}
                            checked={isSelected}
                            onChange={() => chooseVariant(item.id, variant.id)}
                          />
                          {variant.label}
                        </span>
                        <span className="price">{formatPrice(variant.price)}</span>
                      </label>
                    );
                  })}
                </div>

                {item.customizable && (
                  <div className="customize-box">
                    <p className="customize-label">Sacar ingredientes</p>
                    <div className="chip-row">
                      {REMOVALS.map((r) => (
                        <label
                          key={r.id}
                          className={`chip ${getItemCustomization(item.id).removals.includes(r.id) ? "active" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={getItemCustomization(item.id).removals.includes(r.id)}
                            onChange={() => toggleRemoval(item.id, r.id)}
                          />
                          {r.label}
                        </label>
                      ))}
                    </div>

                    <p className="customize-label">Extras</p>
                    <div className="chip-row">
                      {EXTRAS.map((ex) => (
                        <label
                          key={ex.id}
                          className={`chip ${getItemCustomization(item.id).extras.includes(ex.id) ? "active" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={getItemCustomization(item.id).extras.includes(ex.id)}
                            onChange={() => toggleExtra(item.id, ex.id)}
                          />
                          {ex.label} (+{formatPrice(ex.price)})
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button className="add-btn" onClick={() => addToCart(item)}>
                  Agregar al pedido
                </button>
              </div>
            ))}
          </div>
        </main>
      </section>

      {cartWidget}
    </>
  );
}