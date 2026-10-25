"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ClosedScreen({ scheduleText, message }) {
  const [lastOrderCode, setLastOrderCode] = useState(null);

  /* Si el cliente ya había hecho un pedido, le dejamos el acceso
     al seguimiento aunque el local esté cerrado. */
  useEffect(() => {
    setLastOrderCode(localStorage.getItem("fb_last_order_code"));
  }, []);

  return (
    <div className="mode-screen">
      <Image src="/logo.png" alt="Fratelli Burger" width={140} height={140} className="logo-img" />
      <h1 className="mode-title">
        fratelli <span>burger</span>
      </h1>

      <div className="closed-card">
        <h2 className="closed-title">😴 Estamos cerrados</h2>
        {message && <p className="closed-text">{message}</p>}
        {scheduleText && <p className="closed-schedule">{scheduleText}</p>}

        {lastOrderCode && (
          <a className="last-order-link" href={`/pedido/${lastOrderCode}`}>
            📦 Ver mi último pedido: <strong>#{lastOrderCode}</strong>
          </a>
        )}
      </div>
    </div>
  );
}