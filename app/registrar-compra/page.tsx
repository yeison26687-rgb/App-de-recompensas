"use client"

import Link from "next/link"
import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { negocio } from "../config/negocio"

export default function RegistrarCompra() {
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [guardando, setGuardando] = useState(false)

  const [clienteRegistrado, setClienteRegistrado] = useState<{
    id: string
    nombre: string
  } | null>(null)

  async function registrarCliente() {
    if (!nombre.trim() || !telefono.trim()) {
      setError(
        "Introduce al menos el nombre y el teléfono."
      )
      return
    }

    setGuardando(true)
    setError("")

    try {
      const respuesta = await fetch(
        "/api/registrar-cliente",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            telefono,
            email,
          }),
        }
      )

      const resultado = await respuesta.json()

      if (!respuesta.ok || !resultado.ok) {
        setError(
          resultado.error ||
            "No se pudo registrar el cliente."
        )
        return
      }

      if (!resultado.cliente?.id) {
        setError(
          "El cliente se registró, pero no se pudo generar su QR."
        )
        return
      }

      setClienteRegistrado({
        id: resultado.cliente.id,
        nombre:
          resultado.cliente.nombre ||
          nombre.trim(),
      })

      setNombre("")
      setTelefono("")
      setEmail("")
    } catch (error) {
      console.error(
        "Error registrando cliente:",
        error
      )

      setError(
        "No se pudo conectar con el servidor."
      )
    } finally {
      setGuardando(false)
    }
  }

  function registrarOtroCliente() {
    setClienteRegistrado(null)
    setError("")
    setNombre("")
    setTelefono("")
    setEmail("")
  }

  if (clienteRegistrado) {
    const qrValue =
      `https://ancla-kebab-fidelizacion.vercel.app/terminal/${clienteRegistrado.id}`

    return (
      <main className="min-h-screen bg-gray-50 p-6 text-black">
        <div className="mx-auto max-w-md">

          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">

            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              {negocio.nombre}
            </p>

            <div className="mt-4 text-5xl">
              ✅
            </div>

            <h1 className="mt-4 text-2xl font-bold">
              Cliente registrado correctamente
            </h1>

            <p className="mt-2 text-gray-500">
              {clienteRegistrado.nombre} ya forma parte
              del programa de fidelización de{" "}
              <strong>{negocio.nombre}</strong>.
            </p>

            <div className="mt-6 rounded-2xl bg-gray-50 p-5">

              <p className="font-semibold">
                QR del cliente
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Guárdelo para utilizarlo en futuras compras.
              </p>

              <div className="mt-5 flex justify-center">

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <QRCodeSVG
                    value={qrValue}
                    size={220}
                  />
                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={registrarOtroCliente}
              className="mt-6 w-full rounded-xl bg-black py-4 font-semibold text-white"
            >
              ➕ Registrar otro cliente
            </button>

            <Link
              href="/admin"
              className="mt-3 block w-full rounded-xl border border-black py-4 font-semibold"
            >
              ← Volver al panel
            </Link>

          </div>

        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="mx-auto max-w-md">

        <Link
          href="/admin"
          className="text-sm font-semibold"
        >
          ← Volver al panel
        </Link>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            {negocio.nombre}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Registrar cliente
          </h1>

          <p className="mt-2 text-gray-600">
            Registre un nuevo cliente para que pueda
            comenzar a acumular puntos.
          </p>

          <div className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Nombre
              </label>

              <input
                type="text"
                placeholder="Nombre del cliente"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                disabled={guardando}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Teléfono
              </label>

              <input
                type="tel"
                placeholder="Teléfono del cliente"
                value={telefono}
                onChange={(e) =>
                  setTelefono(e.target.value)
                }
                disabled={guardando}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Email
              </label>

              <input
                type="email"
                placeholder="Email (opcional)"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={guardando}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black disabled:bg-gray-100"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                ❌ {error}
              </div>
            )}

            <button
              type="button"
              onClick={registrarCliente}
              disabled={guardando}
              className="w-full rounded-xl bg-black py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando
                ? "Registrando..."
                : "Registrar cliente"}
            </button>

          </div>

        </div>

      </div>
    </main>
  )
}