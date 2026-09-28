"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { iniciarSesionTerminal } from "../actions"
import { negocio } from "../../config/negocio"

export default function TerminalLoginPage() {
  const [clave, setClave] = useState("")
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)

  const router = useRouter()

  async function iniciarSesion(e: React.FormEvent) {
    e.preventDefault()

    setError("")
    setCargando(true)

    const resultado = await iniciarSesionTerminal(clave)

    if (!resultado.ok) {
      setError(
        resultado.error || "No se pudo iniciar sesión"
      )
      setCargando(false)
      return
    }

    router.push("/terminal")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-white p-6 text-black">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            {negocio.nombre}
          </h1>

          <h2 className="mt-8 text-2xl font-bold">
            Acceso al terminal
          </h2>

          <p className="mt-3 text-gray-500">
            Introduzca la clave del establecimiento
          </p>
        </div>

        <form
          onSubmit={iniciarSesion}
          className="mt-8 rounded-2xl border p-6"
        >
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Clave del terminal"
            autoComplete="current-password"
            className="w-full rounded-xl border p-4"
          />

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando || !clave}
            className="mt-4 w-full rounded-xl bg-black py-4 font-semibold text-white disabled:opacity-50"
          >
            {cargando
              ? "Comprobando..."
              : "Entrar al terminal"}
          </button>
        </form>
      </div>
    </main>
  )
}