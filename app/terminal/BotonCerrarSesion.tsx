"use client"

import { useState } from "react"
import { cerrarSesionTerminal } from "./actions"

export default function BotonCerrarSesion() {
  const [cerrando, setCerrando] =
    useState(false)

  async function cerrarSesion() {
    setCerrando(true)

    await cerrarSesionTerminal()
  }

  return (
    <button
      type="button"
      onClick={cerrarSesion}
      disabled={cerrando}
      className="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:bg-gray-100 disabled:opacity-50"
    >
      {cerrando
        ? "Cerrando..."
        : "Cerrar sesión"}
    </button>
  )
}