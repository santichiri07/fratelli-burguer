"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

/* Lee de Supabase si el local está abierto o cerrado.
   Se vuelve a consultar solo cada 30 segundos, así si el dueño
   cierra o abre desde el panel, la página se entera sin recargar.
   Si no se puede leer (error o falta la configuración), se
   asume que el local está abierto. */
export function useStoreStatus() {
  const [status, setStatus] = useState({
    loading: true,
    isOpen: true,
    scheduleText: "",
    message: "",
  });

  async function load() {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", "store")
      .single();

    if (error || !data) {
      setStatus((prev) => ({ ...prev, loading: false }));
      return;
    }

    setStatus({
      loading: false,
      isOpen: data.is_open !== false,
      scheduleText: data.schedule_text || "",
      message: data.closed_message || "",
    });
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return status;
}