"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { negocio } from "../config/negocio"

export default function RegistroCliente() {
  const router = useRouter()

  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] =
    useState("")
  const [email, setEmail] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [guardando, setGuardando] =
    useState(false)

  async function registrarCliente() {
    if (!nombre.trim() || !telefono.trim()) {
      setError(
        "Introduce tu nombre y tu teléfono."
      )
      return
    }

    if (!/^\d{4}$/.test(pin)) {
      setError(
        "El PIN debe tener exactamente 4 números."
      )
      return
    }

    setGuardando(true)
    setError("")

    try {
      const respuesta = await fetch(
        "/api/registro-publico",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            nombre,
            telefono,
            email,
            pin,
          }),
        }
      )

      const resultado =
        await respuesta.json()

      if (!respuesta.ok || !resultado.ok) {
        setError(
          resultado.error ||
            "No se pudo completar el registro."
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
      setGuardando(false)
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
              🌯
            </div>

            <h1 className="mt-4 text-3xl font-bold">
              Únete y consigue recompensas
            </h1>

            <p className="mt-3 text-gray-600">
              Regístrate gratis y empieza a
              acumular puntos con tus compras.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-2xl">⭐</p>
              <p className="mt-1 text-xs font-semibold">
                Puntos
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-2xl">🏆</p>
              <p className="mt-1 text-xs font-semibold">
                Insignias
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-2xl">🎁</p>
              <p className="mt-1 text-xs font-semibold">
                Premios
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Nombre
              </label>

              <input
                type="text"
                autoComplete="name"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                disabled={guardando}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
              />
            </div>

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
                disabled={guardando}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Email{" "}
                <span className="font-normal text-gray-400">
                  (opcional)
                </span>
              </label>

              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={guardando}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Crea un PIN de 4 números
              </label>

              <input
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
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
                disabled={guardando}
                className="w-full rounded-xl border border-gray-300 p-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-black"
              />

              <p className="mt-2 text-xs text-gray-400">
                Lo necesitarás para volver a
                acceder a tu tarjeta.
              </p>
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
              className="w-full rounded-xl bg-black py-4 text-lg font-bold text-white disabled:opacity-50"
            >
              {guardando
                ? "Creando tu tarjeta..."
                : "Crear mi tarjeta"}
            </button>
          </div>

          <div className="mt-7 border-t pt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes una tarjeta?
            </p>

            <Link
              href="/login-cliente"
              className="mt-3 block w-full rounded-xl border-2 border-black py-4 font-bold"
            >
              🔑 Ya soy cliente
            </Link>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-gray-400">
            Tus datos se utilizarán para
            gestionar tu participación en el
            programa de fidelización de{" "}
            {negocio.nombre}.
          </p>

        </div>
      </div>
    </main>
  )
}
