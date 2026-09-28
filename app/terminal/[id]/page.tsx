import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import BotonCanjear from "./BotonCanjear"
import RegistrarCompra from "./RegistrarCompra"
import { negocio } from "../../config/negocio"
import {
  obtenerNombreCookieTerminal,
  sesionTerminalValida,
} from "../../../lib/terminal-auth"

export default async function TerminalClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies()

  const sesionTerminal = cookieStore.get(
    obtenerNombreCookieTerminal()
  )?.value

  if (!sesionTerminalValida(sesionTerminal)) {
    redirect("/terminal/login")
  }

  const { id } = await params

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL

  const secretKey =
    process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !secretKey) {
    return (
      <main className="min-h-screen bg-white p-6 text-black">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold">
            Error de configuración
          </h1>
        </div>
      </main>
    )
  }

  const supabaseAdmin = createClient(
    supabaseUrl,
    secretKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )

  const { data: cliente, error } =
    await supabaseAdmin
      .from("id")
      .select("id, nombre, puntos, saldo_euros")
      .eq("id", id)
      .single()

  const puntos = cliente?.puntos ?? 0

  return (
    <main className="min-h-screen bg-white p-6 text-black">
      <div className="mx-auto max-w-md">

        {/* VOLVER AL TERMINAL */}

        <Link
          href="/terminal"
          className="inline-flex items-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
        >
          ← Volver al terminal
        </Link>

        <div className="text-center">

          <h1 className="mt-6 text-3xl font-bold">
            {negocio.nombre}
          </h1>

          <h2 className="mt-8 text-2xl font-bold">
            Terminal de validación
          </h2>

          <p className="mt-6 text-gray-500">
            Cliente detectado
          </p>

          {error || !cliente ? (
            <>
              <p className="mt-4 font-semibold text-red-600">
                Cliente no encontrado
              </p>

              <Link
                href="/terminal"
                className="mt-6 block w-full rounded-xl bg-black py-4 font-semibold text-white"
              >
                ← Volver al terminal
              </Link>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border p-6">

              <p className="text-gray-500">
                Cliente
              </p>

              <p className="mt-2 text-2xl font-bold">
                {cliente.nombre}
              </p>

              <p className="mt-6 text-gray-500">
                Puntos actuales
              </p>

              <p className="mt-2 text-4xl font-bold">
                {puntos}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Saldo pendiente:{" "}
                {Number(
                  cliente.saldo_euros ?? 0
                ).toFixed(2)}{" "}
                €
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {negocio.fidelizacion.eurosPorPunto} € = 1 punto
              </p>

              {/* REGISTRAR COMPRA */}

              <RegistrarCompra
                clienteId={cliente.id}
              />

              {/* RECOMPENSAS */}

              <div className="mt-8">
                <h3 className="text-xl font-bold">
                  Recompensas
                </h3>

                <div className="mt-4 space-y-4">
                  {negocio.recompensas.map(
                    (recompensa) => {
                      const disponible =
                        puntos >=
                        recompensa.puntosNecesarios

                      const faltan = Math.max(
                        recompensa.puntosNecesarios -
                          puntos,
                        0
                      )

                      return (
                        <div
                          key={recompensa.id}
                          className={
                            disponible
                              ? "rounded-xl border-2 border-black p-4"
                              : "rounded-xl border p-4"
                          }
                        >
                          <p className="text-2xl">
                            {recompensa.id ===
                            "kebab-gratis"
                              ? "🌯"
                              : "🎁"}
                          </p>

                          <p className="mt-2 font-bold">
                            {recompensa.nombre}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Coste:{" "}
                            {
                              recompensa.puntosNecesarios
                            }{" "}
                            puntos
                          </p>

                          {disponible ? (
                            <>
                              <p className="mt-3 text-sm font-semibold">
                                Recompensa disponible
                              </p>

                              <BotonCanjear
                                clienteId={
                                  cliente.id
                                }
                                recompensaId={
                                  recompensa.id
                                }
                                recompensaNombre={
                                  recompensa.nombre
                                }
                                puntosNecesarios={
                                  recompensa.puntosNecesarios
                                }
                              />
                            </>
                          ) : (
                            <p className="mt-3 text-sm text-gray-500">
                              Le faltan {faltan} puntos
                            </p>
                          )}
                        </div>
                      )
                    }
                  )}
                </div>
              </div>

              {/* VOLVER AL ESCÁNER */}

              <div className="mt-8 border-t pt-6">
                <Link
                  href="/terminal"
                  className="block w-full rounded-xl bg-black py-4 text-center font-semibold text-white"
                >
                  📷 Volver a escanear
                </Link>
              </div>

            </div>
          )}

        </div>
      </div>
    </main>
  )
}