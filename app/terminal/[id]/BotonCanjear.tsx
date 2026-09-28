"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function BotonCanjear({
  clienteId,
  recompensaId,
  recompensaNombre,
  puntosNecesarios,
}: {
  clienteId: string
  recompensaId: string
  recompensaNombre: string
  puntosNecesarios: number
}) {
  const [canjeando, setCanjeando] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const router = useRouter()

  async function canjear() {
    const confirmar = window.confirm(
      `¿Confirmar canje de ${puntosNecesarios} puntos por ${recompensaNombre}?`
    )

    if (!confirmar) return

    setCanjeando(true)
    setMensaje("")

    try {
      const respuesta = await fetch("/api/canjear-recompensa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId,
          recompensaId,
        }),
      })

      const resultado = await respuesta.json()

      if (!respuesta.ok || !resultado.ok) {
        setMensaje(
          `❌ ${resultado.error || "No se pudo realizar el canje"}`
        )
        setCanjeando(false)
        return
      }

      const puntosRestantes =
        resultado.resultado?.puntos_restantes

      if (typeof puntosRestantes === "number") {
        setMensaje(
          `✅ ${recompensaNombre} canjeado correctamente. Quedan ${puntosRestantes} puntos.`
        )
      } else {
        setMensaje(
          `✅ ${recompensaNombre} canjeado correctamente.`
        )
      }

      setCanjeando(false)
      router.refresh()
    } catch {
      setMensaje("❌ No se pudo realizar el canje")
      setCanjeando(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={canjear}
        disabled={canjeando}
        className="w-full rounded-xl bg-black py-4 font-semibold text-white disabled:opacity-50"
      >
        {canjeando
          ? "Canjeando..."
          : `🎁 Canjear por ${puntosNecesarios} puntos`}
      </button>

      {mensaje && (
        <p className="mt-3 text-sm font-semibold">
          {mensaje}
        </p>
      )}
    </div>
  )
}