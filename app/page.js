"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";
import dynamic from "next/dynamic";

const DeliveryMap = dynamic(() => import("../components/DeliveryMap"), { ssr: false });
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
//
const EXTRAS = [
  { id: "extra-cheddar", label: "Extra cheddar", price: 1000 },
  { id: "extra-bacon", label: "Extra bacon", price: 1500 },
  { id: "extra-carne", label: "Extra carne", price: 2500 },
  { id: "salsa-extra", label: "Salsa adicional", price: 500 },
];
 //
const MENU = [
  {
    id: "cheese",
    category: "hamburguesas",
    customizable: true,
    name: "Burger Cheese",
    desc: "Pan de papa, Medallon de Carne, Cheddar. Acompañada con papas fritas",
    ingredients: [
    { id: "cheddar", label: "Cheddar" },
    ],
  extras: [
    { nombre: "Cheddar", precio: 500 },
    { nombre: "medallon de carne", precio: 800 },
  ],
    variants: [
      { id: "simple", label: "Simple", price: 7000 },
      { id: "doble", label: "Doble", price: 9000 },
    ],
  },
  {
    id: "bacon cheese",
    category: "hamburguesas",
    customizable: true,
    name: "Bacon Cheese burguer",
    desc: "Pan de papa, Medallon de Carne y Bacon. Acompañada con papas fritas",
    ingredients: [
    { id: "bacon", label: "Bacon" },
    ],
    extras: [
    { nombre: "Bacon", precio: 500 },
    { nombre: "Medallon de carne", precio: 800 },
  ],
    variants: [
      { id: "simple", label: "Simple", price: 10000 },
      { id: "doble", label: "Doble", price: 12000 },
    ],
  },
  {
    id: "AMERICANA",
    category: "hamburguesas",
    customizable: true,
    name: "american",
    desc: "Pan de papa, Medallon de carne,cheddar, Lechuga, Tomate, Pepinillos, Aros de cebolla y salsa. Acompañada con papas fritas",
   ingredients: [
    { id: "lechuga", label: "Lechuga" },
    { id: "tomate", label: "Tomate" },
    { id: "pepinillos", label: "Pepinillos" },
    { id: "cheddar", label: "Cheddar" },
    { id: "aros-cebolla", label: "Aros de cebolla" },
    { id: "salsa", label: "Salsa" },
    ],
    extras: [
    { nombre: "lechuga", precio: 800 },
    { nombre: "Cheddar", precio: 500 },
    { nombre: "Medallon de carne", precio: 800 },
    { nombre: "tomate", precio: 500 },
    { nombre: "pepinillos", precio: 800 },
    { nombre: "aros de cebolla", precio: 500 },
  ],
    variants: [
      { id: "simple", label: "Simple", price: 8000 },
      { id: "doble", label: "Doble", price: 10000 },
    ],
  },
  {
    id: "OKLAHOMA",
    category: "hamburguesas",
    customizable: true,
    name: "OKLAHOMA burger",
    desc: "Pan de papa, Medallon de carne, Cebolla laminada y Cheedar. Acompañada con papas fritas",
    ingredients: [
    { id: "cebolla", label: "Cebolla laminada" },
    { id: "cheddar", label: "Cheddar" },
    ],
    extras: [
    { nombre: "cebolla laminada", precio: 800 },
    { nombre: "Cheddar", precio: 500 },
    { nombre: "Medallon de carne", precio: 800 },
  ],
    variants: [
      { id: "simple", label: "Simple", price: 8000 },
      { id: "doble", label: "Doble", price: 10000 },
    ],
  },
   {
    id: "Estilo americano",
    category: "hamburguesas",
    customizable: true,
    name: "estilo americano",
    desc: "Pan de papa, Medallon de carne, Cheddar, Ceboolla grillada, Pepinillo y Salsa. Acompañada con papas fritas",
    ingredients: [
    { id: "cheddar", label: "Cheddar" },
    { id: "cebolla", label: "Cebolla" },
    { id: "pepinillos", label: "Pepinillos" },
    { id: "salsa", label: "Salsa" },
    ],
    extras: [
    { nombre: "Cheddar", precio: 500 },
    { nombre: "Medallon de carne", precio: 800 },
    { nombre: "cebolla grillada", precio: 500 },
  ],
    variants: [
      { id: "simple", label: "Simple", price: 8000 },
      { id: "doble", label: "Doble", price: 10000 },
    ],
  },
  {
    id: "La Clásica ¼",
    category: "hamburguesas",
    customizable: true,
    name: "La Clásica ¼",
    desc: "Pan de papa, Medallon de carne, Cheddar, Pepinillo, Salsa de ketchup y mostaza. Acompañada con papas fritas",
    ingredients: [
    { id: "cheddar", label: "Cheddar" },
    { id: "salsa", label: "Salsa" },
    { id: "pepinillos", label: "Pepinillos" },
    ],
    extras: [
    { nombre: "Cheddar", precio: 500 },
    { nombre: "Medallon de carne", precio: 800 },
    { nombre: "pepinillos", precio: 800 },
  ],
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
  /*{
    id: "papas-fuente",
    category: "extras",
    name: "Fuentecita de Papas",
    desc: "Para compartir.",
    variants: [
      { id: "sazonadas", label: "Sazonada", price: 4000 },
      { id: "sin-sazonar", label: "Sin sazonar", price: 4000 },
    ],
  },*/
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
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fb_cart");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [customization, setCustomization] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(
    Object.fromEntries(MENU.map((item) => [item.id, item.variants[0].id]))
  );
  const [deliveryStreet, setDeliveryStreet] = useState(""); // calle y número
  const [deliveryDetails, setDeliveryDetails] = useState(""); // piso, depto, referencias
  const [deliveryLat, setDeliveryLat] = useState(null);
  const [deliveryLng, setDeliveryLng] = useState(null);
  const [deliveryError, setDeliveryError] = useState("");
  const [deliveryZone, setDeliveryZone] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [lastOrderCode, setLastOrderCode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fb_last_order_code") || null;
    }
    return null;
  });

  // Persistir carrito en localStorage
  useEffect(() => {
    localStorage.setItem("fb_cart", JSON.stringify(cart));
  }, [cart]);

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
    const item = MENU.find((m) => m.id === itemId);
    const removal = (item?.ingredients || []).find((r) => r.id === removalId);
    const removalLabel = removal?.label?.toLowerCase();

    const removals = current.removals.includes(removalId)
      ? current.removals.filter((r) => r !== removalId)
      : [...current.removals, removalId];

    // Si agregamos una remoción, quitar el extra correspondiente si existe
    let extras = current.extras;
    if (removalLabel && !current.removals.includes(removalId)) {
      const extraToRemove = (item?.extras || []).findIndex(
        (ex) => ex.nombre.toLowerCase() === removalLabel
      );
      if (extraToRemove >= 0) {
        extras = current.extras.filter((e) => e !== String(extraToRemove));
      }
    }

    setCustomization((prev) => ({ ...prev, [itemId]: { ...current, removals, extras } }));
  }

  function toggleExtra(itemId, extraId) {
    const current = getItemCustomization(itemId);
    const item = MENU.find((m) => m.id === itemId);
    const extra = (item?.extras || [])[Number(extraId)];
    const extraName = extra?.nombre?.toLowerCase();

    const extras = current.extras.includes(extraId)
      ? current.extras.filter((e) => e !== extraId)
      : [...current.extras, extraId];

    // Si agregamos un extra, quitar la remoción correspondiente si existe
    let removals = current.removals;
    if (extraName && !current.extras.includes(extraId)) {
      const removalToRemove = (item?.ingredients || []).findIndex(
        (r) => r.label.toLowerCase() === extraName
      );
      if (removalToRemove >= 0) {
        const removalId = item.ingredients[removalToRemove].id;
        removals = current.removals.filter((r) => r !== removalId);
      }
    }

    setCustomization((prev) => ({ ...prev, [itemId]: { ...current, removals, extras } }));
  }

  function addToCart(item) {
    const variantId = selectedVariant[item.id];
    const variant = item.variants.find((v) => v.id === variantId);

    let extraPrice = 0;
    let notesParts = [];

    if (item.customizable) {
      const custom = getItemCustomization(item.id);

      custom.removals.forEach((rId) => {
  const removal = (item.ingredients || []).find((r) => r.id === rId);
  if (removal) notesParts.push(`Sin ${removal.label}`);
});

            custom.extras.forEach((eId) => {
        const extra = (item.extras || [])[Number(eId)];
        if (extra) {
          notesParts.push(`Extra ${extra.nombre}`);
          extraPrice += extra.precio;
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

  function handleDeliveryStreetChange(e) {
    setDeliveryStreet(e.target.value);
    setDeliveryError("");
  }

  function handleDeliveryDetailsChange(e) {
    setDeliveryDetails(e.target.value);
    setDeliveryError("");
  }

  function handleMapPositionChange(pos) {
    if (pos) {
      setDeliveryLat(pos.lat);
      setDeliveryLng(pos.lng);
      setDeliveryError("");
      // Template para que el usuario complete
      setDeliveryStreet("Calle y número: ");
      setDeliveryDetails("Piso/Depto/Referencias: ");
    }
  }

  function handleZoneChange(zone) {
    setDeliveryZone(zone);
    setDeliveryFee(zone?.price || 0);
  }

  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.qty, 0),
    [cart]
  );
  const total = useMemo(() => subtotal + (orderMode === "delivery" ? deliveryFee : 0), [subtotal, orderMode, deliveryFee]);
  const itemCount = useMemo(() => cart.reduce((sum, line) => sum + line.qty, 0), [cart]);

  const visibleItems = useMemo(
    () => MENU.filter((item) => item.category === viewingCategory),
    [viewingCategory]
  );

  const currentCategory = CATEGORIES.find((c) => c.id === viewingCategory);

async function checkoutOnWhatsApp() {
  if (cart.length === 0) return;

  if (orderMode === "delivery") {
    if (!deliveryStreet.trim()) {
      setDeliveryError("Por favor, ingresá la calle y número.");
      return;
    }
    if (deliveryLat === null || deliveryLng === null) {
      setDeliveryError("Por favor, marcá la ubicación exacta en el mapa.");
      return;
    }
    if (!deliveryZone) {
      setDeliveryError("La ubicación seleccionada está fuera de la zona de entrega. Mové el pin a una zona cubierta.");
      return;
    }
  }
  setDeliveryError("");

  const orderCode = String(Math.floor(1000 + Math.random() * 9000));
  const lines = cart.map((line) => {
    const notesPart = line.notes ? ` [${line.notes}]` : "";
    return `• ${line.qty}x ${line.name} (${line.variantLabel})${notesPart} - ${formatPrice(line.price * line.qty)}`;
  });

  const modeLabel = orderMode === "delivery" ? "Envío / Delivery" : "Retiro en el local";

  const messageParts = [
    `¡Hola! Quiero hacer el pedido #${orderCode}:`,
    "",
    `Modalidad: ${modeLabel}`,
    "",
    ...lines,
    "",
  ];

  if (orderMode === "delivery") {
    messageParts.push(`Subtotal: ${formatPrice(subtotal)}`);
    messageParts.push(`Envío (${deliveryZone.name}): ${formatPrice(deliveryFee)}`);
    messageParts.push(`Total: ${formatPrice(total)}`);
    messageParts.push("");
    const fullAddress = `${deliveryStreet.trim()}${deliveryDetails.trim() ? `\n${deliveryDetails.trim()}` : ""}`;
    messageParts.push("Dirección:", fullAddress);
    if (deliveryLat !== null && deliveryLng !== null) {
      messageParts.push(`Ver en mapa: https://www.google.com/maps?q=${deliveryLat},${deliveryLng}`);
    }
  } else {
    messageParts.push(`Total: ${formatPrice(total)}`);
    messageParts.push("");
  }

  messageParts.push("Nombre:");

  const message = messageParts.filter(Boolean).join("\n");

  /* Guardamos el pedido en Supabase. Si falla, igual dejamos
     que el cliente pueda mandar el WhatsApp (no lo bloqueamos). */
  try {
    const fullAddress = orderMode === "delivery"
      ? `${deliveryStreet.trim()}${deliveryDetails.trim() ? `\n${deliveryDetails.trim()}` : ""}`
      : null;
    await supabase.from("orders").insert({
      mode: orderMode,
      items: cart,
      total: total,
      subtotal: orderMode === "delivery" ? subtotal : null,
      delivery_fee: orderMode === "delivery" ? deliveryFee : null,
      delivery_zone: orderMode === "delivery" ? deliveryZone?.id : null,
      code: orderCode,
      delivery_address: fullAddress,
      delivery_lat: orderMode === "delivery" ? deliveryLat : null,
      delivery_lng: orderMode === "delivery" ? deliveryLng : null,
    });
    // Guardar código del último pedido para acceso rápido
    localStorage.setItem("fb_last_order_code", orderCode);
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
              {orderMode === "delivery" && deliveryZone && (
                <>
                  <div className="ticket-subtotal">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="ticket-shipping">
                    <span>Envío ({deliveryZone.name})</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                </>
              )}
              <div className="ticket-final-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="ticket-footer">
              <div className="ticket-footer-row">
                <button className="whatsapp-btn" onClick={checkoutOnWhatsApp} disabled={cart.length === 0}>
                  Enviar pedido por WhatsApp
                </button>
                <div className="payment-note">
                  <strong>💳 Pago:</strong> Enviá el comprobante al alias <strong>oziel.a</strong> a nombre de <strong>Oziel Nicolás Acuña</strong>
                </div>
              </div>
              <p className="ticket-note">
                {orderMode === "delivery"
                  ? deliveryZone
                    ? "Ubicación confirmada. Se abre WhatsApp con tu pedido ya armado."
                    : "Marcá tu ubicación en el mapa para ver el costo de envío."
                  : "Se abre WhatsApp con tu pedido ya armado. Completás nombre ahí."}
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

          {lastOrderCode && (
            <a className="last-order-link" href={`/pedido/${lastOrderCode}`}>
              📦 Ver mi pedido en curso: <strong>#{lastOrderCode}</strong>
            </a>
          )}
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

      {orderMode === "delivery" && (
        <section className="menu-bg">
          <div className="delivery-section">
            <div className="delivery-section-inner">
              <h2 className="delivery-title">📍 Datos de entrega</h2>

              <div className="delivery-field">
                <label htmlFor="delivery-street">Calle y número <span className="required">*</span></label>
                <input
                  type="text"
                  id="delivery-street"
                  className="delivery-input"
                  placeholder="Ej: Diagonal 77 N° 809 e/ 11 y 12"
                  value={deliveryStreet}
                  onChange={handleDeliveryStreetChange}
                  required
                  autoComplete="street-address"
                />
              </div>

              <div className="delivery-field">
                <label htmlFor="delivery-details">Piso / Depto / Referencias (opcional)</label>
                <input
                  type="text"
                  id="delivery-details"
                  className="delivery-input"
                  placeholder="Ej: 2° B, puerta negra, timbre rojo"
                  value={deliveryDetails}
                  onChange={handleDeliveryDetailsChange}
                  autoComplete="address-level2"
                />
              </div>

              {deliveryError && <p className="delivery-error">{deliveryError}</p>}

              <div className="delivery-map-container">
                <Suspense fallback={<div className="delivery-map-container-inner"><div className="delivery-map-loading"><div className="map-spinner" /><p>Cargando mapa...</p></div></div>}>
                  <DeliveryMap
                    initialPosition={deliveryLat && deliveryLng ? { lat: deliveryLat, lng: deliveryLng } : null}
                    onPositionChange={handleMapPositionChange}
                    onZoneChange={handleZoneChange}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      )}

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
                    {item.ingredients && item.ingredients.length > 0 && (
  <>
    <p className="customize-label">Sacar ingredientes</p>
    <div className="chip-row">
      {item.ingredients.map((r) => (
        <label
          key={r.id}
          className={`chip ${getItemCustomization(item.id).removals.includes(r.id) ? "active" : ""}`}
        >
          <input
            type="checkbox"
            checked={getItemCustomization(item.id).removals.includes(r.id)}
            onChange={() => toggleRemoval(item.id, r.id)}
          />
          Sin {r.label}
        </label>
      ))}
    </div>
  </>
)}

  {item.extras && item.extras.length > 0 && (
                      <>
                        <p className="customize-label">Extras</p>
                        <div className="chip-row">
                          {item.extras.map((ex, idx) => {
                            const extraId = String(idx);
                            const isOn = getItemCustomization(item.id).extras.includes(extraId);
                            return (
                              <label key={extraId} className={`chip ${isOn ? "active" : ""}`}>
                                <input
                                  type="checkbox"
                                  checked={isOn}
                                  onChange={() => toggleExtra(item.id, extraId)}
                                />
                                Extra {ex.nombre} (+{formatPrice(ex.precio)})
                              </label>
                            );
                          })}
                        </div>
                      </>
                    )}
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