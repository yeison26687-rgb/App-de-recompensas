"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { negocio } from "../config/negocio"

export default function LoginCliente() {
  const router = useRouter()

  const [telefono, setTelefono] =
    useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [comprobando, setComprobando] =
    useState(false)

  async function iniciarSesion() {
    if (
      !telefono.trim() ||
      !/^\d{4}$/.test(pin)
    ) {
      setError(
        "Introduce tu teléfono y tu PIN de 4 números."
      )
      return
    }

    setComprobando(true)
    setError("")

    try {
      const respuesta = await fetch(
        "/api/login-cliente",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            telefono,
            pin,
          }),
        }
      )

      const resultado =
        await respuesta.json()

      if (!respuesta.ok || !resultado.ok) {
        setError(
          resultado.error ||
            "Teléfono o PIN incorrectos."
        )
        return
      }

      if (!resultado.cliente?.id) {
        setError(
          "No se pudo abrir tu tarjeta."
        )
        return
      }

      router.push(
        `/cliente/${resultado.cliente.id}`
      )
    } catch {
      setError(
        "No se pudo conectar con el servidor."
      )
    } finally {
      setComprobando(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-black">
      <div className="mx-auto max-w-md">

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              {negocio.nombre}
            </p>

            <div className="mt-5 text-6xl">
              🔑
            </div>

            <h1 className="mt-4 text-3xl font-bold">
              Mi tarjeta
            </h1>

            <p className="mt-3 text-gray-600">
              Introduce tu teléfono y tu PIN
              para acceder a tus puntos,
              insignias y recompensas.
            </p>
          </div>

          <div className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Teléfono
              </label>

              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Tu teléfono"
                value={telefono}
                onChange={(e) =>
                  setTelefono(e.target.value)
                }
                disabled={comprobando}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                PIN
              </label>

              <input
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) =>
                  setPin(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4)
                  )
                }
                disabled={comprobando}
                className="w-full rounded-xl border border-gray-300 p-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-black"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                ❌ {error}
              </div>
            )}

            <button
              type="button"
              onClick={iniciarSesion}
              disabled={comprobando}
              className="w-full rounded-xl bg-black py-4 text-lg font-bold text-white disabled:opacity-50"
            >
              {comprobando
                ? "Comprobando..."
                : "Entrar en mi tarjeta"}
            </button>

            <div className="mt-4 rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-sm font-semibold">
                ¿Olvidaste tu PIN?
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Solicita el restablecimiento en el establecimiento.
              </p>
            </div>
          </div>

          <div className="mt-7 border-t pt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Todavía no estás registrado?
            </p>

            <Link
              href="/registro"
              className="mt-3 block w-full rounded-xl border-2 border-black py-4 font-bold"
            >
              Crear mi tarjeta
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}

