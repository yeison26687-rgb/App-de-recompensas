"use client"

import { useState } from "react"

type ClienteEncontrado = {
  id: string
  nombre: string
  telefono: string
}

export default function RestablecerPin() {
  const [telefono, setTelefono] = useState("")
  const [nuevoPin, setNuevoPin] = useState("")
  const [cliente, setCliente] =
    useState<ClienteEncontrado | null>(null)

  const [mensaje, setMensaje] = useState("")
  const [error, setError] = useState("")
  const [buscando, setBuscando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function buscarCliente() {
    const telefonoLimpio = telefono.trim()

    if (!telefonoLimpio) {
      setError("Introduzca el número de teléfono.")
      return
    }

    setBuscando(true)
    setError("")
    setMensaje("")
    setCliente(null)
    setNuevoPin("")

    try {
      const respuesta = await fetch(
        `/api/restablecer-pin?telefono=${encodeURIComponent(
          telefonoLimpio
        )}`
      )

      const resultado = await respuesta.json()

      if (!respuesta.ok || !resultado.ok) {
        setError(
          resultado.error ||
            "No se pudo localizar al cliente."
        )
        return
      }

      setCliente(resultado.cliente)
    } catch {
      setError(
        "No se pudo conectar con el servidor."
      )
    } finally {
      setBuscando(false)
    }
  }

  async function restablecerPin() {
    if (!cliente) {
      return
    }

    if (!/^\d{4}$/.test(nuevoPin)) {
      setError(
        "El nuevo PIN debe tener exactamente 4 números."
      )
      return
    }

    const confirmado = window.confirm(
      `¿Restablecer el PIN de ${cliente.nombre}?`
    )

    if (!confirmado) {
      return
    }

    setGuardando(true)
    setError("")
    setMensaje("")

    try {
      const respuesta = await fetch(
        "/api/restablecer-pin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clienteId: cliente.id,
            nuevoPin,
          }),
        }
      )

      const resultado = await respuesta.json()

      if (!respuesta.ok || !resultado.ok) {
        setError(
          resultado.error ||
            "No se pudo restablecer el PIN."
        )
        return
      }

      setMensaje(
        "PIN restablecido correctamente. El cliente ya puede iniciar sesión con su nuevo PIN."
      )

      setNuevoPin("")
    } catch {
      setError(
        "No se pudo conectar con el servidor."
      )
    } finally {
      setGuardando(false)
    }
  }

  function limpiar() {
    setTelefono("")
    setNuevoPin("")
    setCliente(null)
    setError("")
    setMensaje("")
  }

  return (
    <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold">
          🔐 Restablecimiento de PIN
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Busque al cliente por su número de teléfono.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="tel"
          inputMode="tel"
          placeholder="Número de teléfono del cliente"
          value={telefono}
          onChange={(e) => {
            setTelefono(e.target.value)
            setCliente(null)
            setMensaje("")
            setError("")
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              buscarCliente()
            }
          }}
          className="min-w-0 flex-1 rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
        />

        <button
          type="button"
          onClick={buscarCliente}
          disabled={buscando}
          className="rounded-xl bg-black px-6 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {buscando ? "Buscando..." : "🔍 Buscar"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          ❌ {error}
        </div>
      )}

      {mensaje && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          ✅ {mensaje}
        </div>
      )}

      {cliente && (
        <div className="mt-5 rounded-2xl border p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Cliente encontrado
          </p>

          <p className="mt-2 text-2xl font-bold">
            {cliente.nombre}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Teléfono: {cliente.telefono}
          </p>

          <div className="mt-5 border-t pt-5">
            <label className="mb-2 block text-sm font-semibold">
              Nuevo PIN de 4 números
            </label>

            <input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={4}
              placeholder="••••"
              value={nuevoPin}
              onChange={(e) =>
                setNuevoPin(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 4)
                )
              }
              className="w-full rounded-xl border border-gray-300 p-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-black"
            />

            <button
              type="button"
              onClick={restablecerPin}
              disabled={
                guardando ||
                !/^\d{4}$/.test(nuevoPin)
              }
              className="mt-4 w-full rounded-xl bg-black py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando
                ? "Restableciendo..."
                : "🔐 Restablecer PIN"}
            </button>

            <button
              type="button"
              onClick={limpiar}
              className="mt-3 w-full rounded-xl border py-3 font-semibold"
            >
              Buscar otro cliente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
