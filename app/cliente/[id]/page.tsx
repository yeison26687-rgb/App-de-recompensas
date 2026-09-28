import { createClient } from "@supabase/supabase-js"
import { negocio } from "../../config/negocio"
import CodigoQRCliente from "./CodigoQRCliente"

export default async function ClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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
      .select(
        "id, nombre, puntos, saldo_euros"
      )
      .eq("id", id)
      .single()

  if (error || !cliente) {
    return (
      <main className="min-h-screen bg-white p-6 text-black">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold">
            Cliente no encontrado
          </h1>
        </div>
      </main>
    )
  }

  const puntos = cliente.puntos ?? 0

  const saldoEuros = Number(
    cliente.saldo_euros ?? 0
  )

  return (
    <main className="min-h-screen bg-white p-6 text-black">
      <div className="mx-auto max-w-md text-center">

        <h1 className="text-3xl font-bold">
          {negocio.nombre}
        </h1>

        <p className="mt-8 text-gray-500">
          Cliente
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          {cliente.nombre}
        </h2>

        {/* PUNTOS */}

        <div className="mt-8 rounded-2xl border p-6">
          <p className="text-gray-500">
            Tus puntos
          </p>

          <p className="mt-2 text-5xl font-bold">
            {puntos}
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Cada{" "}
            {negocio.fidelizacion.eurosPorPunto} €
            de consumo = 1 punto
          </p>

          {saldoEuros > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Tienes {saldoEuros.toFixed(2)} €
              acumulados para tu próximo punto
            </p>
          )}
        </div>

        {/* QR DEL CLIENTE */}

        <div className="mt-6 rounded-2xl border p-6">
          <h3 className="text-xl font-bold">
            Mi código QR
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Muestre este código en el
            establecimiento.
          </p>

          <div className="mt-5">
            <CodigoQRCliente
              clienteId={String(cliente.id)}
            />
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Código personal de fidelización
          </p>
        </div>

        {/* RECOMPENSAS */}

        <div className="mt-6 space-y-4">
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
                      ? "rounded-2xl border-2 border-black p-6"
                      : "rounded-2xl border p-6"
                  }
                >
                  <p className="text-3xl">
                    {recompensa.id ===
                    "kebab-gratis"
                      ? "🌯"
                      : "🎁"}
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    {recompensa.nombre}
                  </h3>

                  <p className="mt-2 text-gray-500">
                    {
                      recompensa.puntosNecesarios
                    }{" "}
                    puntos
                  </p>

                  {disponible ? (
                    <>
                      <p className="mt-4 font-bold">
                        ¡Recompensa disponible!
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        Muestre su QR en el
                        establecimiento para
                        canjearla.
                      </p>
                    </>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">
                      Le faltan {faltan} puntos
                    </p>
                  )}
                </div>
              )
            }
          )}
        </div>

      </div>
    </main>
  )
}