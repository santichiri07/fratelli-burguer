"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function StoreStatusControl() {
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [scheduleText, setScheduleText] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", "store")
        .single();

      if (error || !data) {
        setMissing(true);
      } else {
        setIsOpen(data.is_open !== false);
        setScheduleText(data.schedule_text || "");
        setMessage(data.closed_message || "");
      }
      setLoaded(true);
    }
    load();
  }, []);

  async function toggleOpen() {
    const next = !isOpen;

    if (!next) {
      const ok = window.confirm(
        "¿Cerrar el local? Los clientes no van a poder hacer pedidos hasta que lo vuelvas a abrir."
      );
      if (!ok) return;
    }

    const { data, error } = await supabase
      .from("settings")
      .update({ is_open: next })
      .eq("id", "store")
      .select();

    if (error || !data || data.length === 0) {
      setFeedback("No se pudo actualizar. Probá de nuevo.");
      return;
    }

    setIsOpen(next);
    setFeedback(next ? "Listo, el local quedó abierto." : "Listo, el local quedó cerrado.");
  }

  async function saveTexts() {
    const { data, error } = await supabase
      .from("settings")
      .update({ schedule_text: scheduleText, closed_message: message })
      .eq("id", "store")
      .select();

    if (error || !data || data.length === 0) {
      setFeedback("No se pudieron guardar los textos. Probá de nuevo.");
      return;
    }
    setFeedback("Textos guardados.");
  }

  if (!loaded) return null;

  if (missing) {
    return (
      <div className="store-control">
        <p className="store-feedback">
          Falta crear la configuración del local en Supabase (hay que correr el SQL de la tabla settings).
        </p>
      </div>
    );
  }

  return (
    <div className="store-control">
      <div className="store-control-top">
        <span className="store-status">
          {isOpen ? "🟢 Local abierto" : "🔴 Local cerrado"}
        </span>
        <button
          className={`store-toggle-btn ${isOpen ? "close" : "open"}`}
          onClick={toggleOpen}
        >
          {isOpen ? "Cerrar local" : "Abrir local"}
        </button>
      </div>

      <label className="store-label">Días y horarios (lo que ve el cliente cuando está cerrado)</label>
      <input
        className="store-input"
        type="text"
        placeholder="Ej: Abrimos de jueves a domingo, de 20:00 a 23:30"
        value={scheduleText}
        onChange={(e) => setScheduleText(e.target.value)}
      />

      <label className="store-label">Mensaje (opcional)</label>
      <input
        className="store-input"
        type="text"
        placeholder="Ej: Gracias por pasar, ¡te esperamos!"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button className="store-save-btn" onClick={saveTexts}>
        Guardar textos
      </button>

      {feedback && <p className="store-feedback">{feedback}</p>}
    </div>
  );
}