import { createClient } from "@supabase/supabase-js"
import { negocio } from "../../config/negocio"
import CodigoQRCliente from "./CodigoQRCliente"

const insignias = [
  {
    nombre: "Primer bocado",
    compras: 1,
    icono: "🌱",
    descripcion: "Primera compra en ANCLA KEBAB",
  },
  {
    nombre: "Cliente habitual",
    compras: 5,
    icono: "🔥",
    descripcion: "5 compras realizadas",
  },
  {
    nombre: "Fan de Ancla",
    compras: 10,
    icono: "🌯",
    descripcion: "10 compras realizadas",
  },
  {
    nombre: "Cliente VIP",
    compras: 25,
    icono: "⭐",
    descripcion: "25 compras realizadas",
  },
  {
    nombre: "Leyenda Ancla",
    compras: 50,
    icono: "👑",
    descripcion: "50 compras realizadas",
  },
]

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

  // Contamos todas las compras históricas del cliente.
  // Las insignias NO dependen de los puntos actuales.
  const { count: numeroCompras } =
    await supabaseAdmin
      .from("compras")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("cliente_id", id)

  const totalCompras = numeroCompras ?? 0

  const puntos = cliente.puntos ?? 0

  const saldoEuros = Number(
    cliente.saldo_euros ?? 0
  )

  const siguienteInsignia =
    insignias.find(
      (insignia) =>
        totalCompras < insignia.compras
    )

  const insigniaAnterior =
    [...insignias]
      .reverse()
      .find(
        (insignia) =>
          totalCompras >= insignia.compras
      )

  const inicioProgreso =
    insigniaAnterior?.compras ?? 0

  const porcentajeProgreso =
    siguienteInsignia
      ? Math.min(
          100,
          Math.max(
            0,
            ((totalCompras - inicioProgreso) /
              (siguienteInsignia.compras -
                inicioProgreso)) *
              100
          )
        )
      : 100

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

        {/* QR */}

        <div className="mt-6 rounded-2xl border p-6">
          <h3 className="text-xl font-bold">
            Mi código QR
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Muestre este código en el establecimiento.
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

        {/* INSIGNIAS */}

        <div className="mt-6 rounded-2xl border p-6">
          <h3 className="text-2xl font-bold">
            🏆 Mis insignias
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {totalCompras}{" "}
            {totalCompras === 1
              ? "compra realizada"
              : "compras realizadas"}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {insignias.map((insignia) => {
              const conseguida =
                totalCompras >= insignia.compras

              return (
                <div
                  key={insignia.nombre}
                  className={
                    conseguida
                      ? "rounded-2xl border-2 border-black p-4"
                      : "rounded-2xl border bg-gray-50 p-4 opacity-50"
                  }
                >
                  <div
                    className={
                      conseguida
                        ? "text-4xl"
                        : "text-4xl grayscale"
                    }
                  >
                    {insignia.icono}
                  </div>

                  <p className="mt-2 font-bold">
                    {insignia.nombre}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {insignia.descripcion}
                  </p>

                  <p className="mt-2 text-xs font-semibold">
                    {conseguida
                      ? "✓ Conseguida"
                      : `🔒 ${insignia.compras} compras`}
                  </p>
                </div>
              )
            })}
          </div>

          {/* PROGRESO */}

          {siguienteInsignia ? (
            <div className="mt-7">
              <div className="flex justify-between text-sm">
                <span>
                  Próxima insignia
                </span>

                <span className="font-bold">
                  {siguienteInsignia.icono}{" "}
                  {siguienteInsignia.nombre}
                </span>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-black transition-all"
                  style={{
                    width: `${porcentajeProgreso}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm text-gray-500">
                Te faltan{" "}
                {siguienteInsignia.compras -
                  totalCompras}{" "}
                {siguienteInsignia.compras -
                  totalCompras ===
                1
                  ? "compra"
                  : "compras"}{" "}
                para conseguir{" "}
                <strong>
                  {siguienteInsignia.nombre}
                </strong>
              </p>
            </div>
          ) : (
            <div className="mt-7 rounded-xl bg-black p-4 text-white">
              <p className="font-bold">
                👑 ¡Has conseguido todas las
                insignias!
              </p>

              <p className="mt-1 text-sm">
                Eres una Leyenda Ancla.
              </p>
            </div>
          )}
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