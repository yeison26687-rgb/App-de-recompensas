import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { negocio } from "../config/negocio"
import {
  obtenerNombreCookieTerminal,
  sesionTerminalValida,
} from "../../lib/terminal-auth"
import BotonCerrarSesion from "../terminal/BotonCerrarSesion"

export default async function AdminPage() {
  const cookieStore = await cookies()

  const sesionTerminal = cookieStore.get(
    obtenerNombreCookieTerminal()
  )?.value

  if (!sesionTerminalValida(sesionTerminal)) {
    redirect("/terminal/login")
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL

  const secretKey =
    process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !secretKey) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 text-black">
        <div className="mx-auto max-w-6xl">
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

  const { data: clientes } = await supabaseAdmin
    .from("id")
    .select(
      "id, nombre, puntos, saldo_euros, created_at"
    )
    .order("created_at", { ascending: false })

  const { data: canjes } = await supabaseAdmin
    .from("canjes")
    .select(
      "id, cliente_id, recompensa, puntos_usados, created_at"
    )
    .order("created_at", { ascending: false })

  const { data: compras } = await supabaseAdmin
    .from("compras")
    .select(
      "id, cliente_id, importe, puntos_generados, saldo_anterior, saldo_nuevo, created_at"
    )
    .order("created_at", { ascending: false })

  const totalClientes = clientes?.length ?? 0

  const totalPuntos =
    clientes?.reduce(
      (total, cliente) =>
        total + (cliente.puntos ?? 0),
      0
    ) ?? 0

  const totalCanjes = canjes?.length ?? 0
  const totalCompras = compras?.length ?? 0

  const ventasRegistradas =
    compras?.reduce(
      (total, compra) =>
        total + Number(compra.importe ?? 0),
      0
    ) ?? 0

  const puntosGenerados =
    compras?.reduce(
      (total, compra) =>
        total +
        Number(compra.puntos_generados ?? 0),
      0
    ) ?? 0

  const ticketMedio =
    totalCompras > 0
      ? ventasRegistradas / totalCompras
      : 0

  const clientesConRecompensa =
    clientes?.filter((cliente) =>
      negocio.recompensas.some(
        (recompensa) =>
          (cliente.puntos ?? 0) >=
          recompensa.puntosNecesarios
      )
    ).length ?? 0

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="mx-auto max-w-6xl">

        {/* CABECERA */}

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              {negocio.descripcion}
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {negocio.nombre}
            </h1>

            <p className="mt-2 text-gray-500">
              Panel de control del establecimiento
            </p>
          </div>

          <BotonCerrarSesion />
        </div>

        {/* ACCIONES RÁPIDAS */}

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold">
            Acciones rápidas
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/registrar-compra"
              className="rounded-2xl bg-black p-5 text-white transition hover:opacity-90"
            >
              <p className="text-2xl">➕</p>

              <p className="mt-2 font-bold">
                Registrar cliente
              </p>

              <p className="mt-1 text-sm text-gray-300">
                Crear un nuevo cliente
              </p>
            </Link>

            <Link
              href="/terminal"
              className="rounded-2xl border bg-white p-5 transition hover:bg-gray-50"
            >
              <p className="text-2xl">📷</p>

              <p className="mt-2 font-bold">
                Abrir terminal
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Leer códigos QR de clientes
              </p>
            </Link>

            <a
              href="#recompensas"
              className="rounded-2xl border bg-white p-5 transition hover:bg-gray-50"
            >
              <p className="text-2xl">🎁</p>

              <p className="mt-2 font-bold">
                Ver recompensas
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Consultar premios y canjes
              </p>
            </a>
          </div>
        </div>

        {/* ESTADÍSTICAS PRINCIPALES */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              💶 Ventas registradas
            </p>

            <p className="mt-2 text-4xl font-bold">
              {ventasRegistradas.toFixed(2)} €
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Consumo registrado mediante fidelización
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              🧾 Compras
            </p>

            <p className="mt-2 text-4xl font-bold">
              {totalCompras}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Operaciones registradas
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              📊 Ticket medio
            </p>

            <p className="mt-2 text-4xl font-bold">
              {ticketMedio.toFixed(2)} €
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Importe medio por compra
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              ⭐ Puntos generados
            </p>

            <p className="mt-2 text-4xl font-bold">
              {puntosGenerados}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Generados por las compras registradas
            </p>
          </div>
        </div>

        {/* ESTADÍSTICAS DEL PROGRAMA */}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              👥 Clientes
            </p>

            <p className="mt-2 text-4xl font-bold">
              {totalClientes}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Registrados en el programa
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              ⭐ Puntos disponibles
            </p>

            <p className="mt-2 text-4xl font-bold">
              {totalPuntos}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Entre todos los clientes
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              🎁 Recompensas canjeadas
            </p>

            <p className="mt-2 text-4xl font-bold">
              {totalCanjes}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Canjes realizados
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              🏆 Con recompensa disponible
            </p>

            <p className="mt-2 text-4xl font-bold">
              {clientesConRecompensa}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Clientes que pueden canjear
            </p>
          </div>
        </div>

        {/* CLIENTES */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Clientes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Clientes registrados en el programa
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
              {totalClientes}
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="p-3">
                    Cliente
                  </th>

                  <th className="p-3">
                    Puntos
                  </th>

                  <th className="p-3">
                    Saldo
                  </th>

                  <th className="p-3">
                    Registro
                  </th>

                  <th className="p-3">
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody>
                {clientes && clientes.length > 0 ? (
                  clientes.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="border-b last:border-0"
                    >
                      <td className="p-3 font-semibold">
                        {cliente.nombre ||
                          "Sin nombre"}
                      </td>

                      <td className="p-3">
                        <span className="font-bold">
                          {cliente.puntos ?? 0}
                        </span>
                      </td>

                      <td className="p-3 text-sm">
                        {Number(
                          cliente.saldo_euros ?? 0
                        ).toFixed(2)}{" "}
                        €
                      </td>

                      <td className="p-3 text-sm text-gray-500">
                        {cliente.created_at
                          ? new Date(
                              cliente.created_at
                            ).toLocaleDateString(
                              "es-ES"
                            )
                          : "—"}
                      </td>

                      <td className="p-3">
                        <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                          ● Activo
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-gray-500"
                    >
                      Todavía no hay clientes
                      registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECOMPENSAS */}

        <div
          id="recompensas"
          className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                🎁 Recompensas
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Recompensas activas del programa
              </p>
            </div>

            <span className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">
              {negocio.recompensas.length} ACTIVAS
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {negocio.recompensas.map(
              (recompensa) => (
                <div
                  key={recompensa.id}
                  className="rounded-2xl border p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-2xl">
                        {recompensa.id ===
                        "kebab-gratis"
                          ? "🌯"
                          : "🎁"}
                      </p>

                      <p className="mt-2 text-lg font-bold">
                        {recompensa.nombre}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Recompensa disponible al
                        alcanzar{" "}
                        {
                          recompensa.puntosNecesarios
                        }{" "}
                        puntos.
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-bold">
                        {
                          recompensa.puntosNecesarios
                        }
                      </p>

                      <p className="text-sm text-gray-500">
                        puntos
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-5 border-t pt-4">
            <p className="text-sm text-gray-500">
              Canjes realizados
            </p>

            <p className="mt-1 text-2xl font-bold">
              {totalCanjes}
            </p>
          </div>
        </div>

        {/* ÚLTIMAS COMPRAS */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                🧾 Últimas compras
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Últimas operaciones registradas
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
              {totalCompras} compras
            </span>
          </div>

          {compras && compras.length > 0 ? (
            <div className="mt-5 space-y-3">
              {compras
                .slice(0, 10)
                .map((compra) => {
                  const cliente = clientes?.find(
                    (cliente) =>
                      cliente.id ===
                      compra.cliente_id
                  )

                  return (
                    <div
                      key={compra.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          💶
                        </div>

                        <div>
                          <p className="font-semibold">
                            {Number(
                              compra.importe
                            ).toFixed(2)}{" "}
                            €
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Cliente:{" "}
                            {cliente?.nombre ??
                              "Cliente desconocido"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {compra.created_at
                              ? new Date(
                                  compra.created_at
                                ).toLocaleString(
                                  "es-ES"
                                )
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">
                          +
                          {
                            compra.puntos_generados
                          }
                        </p>

                        <p className="text-xs text-gray-500">
                          puntos
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Saldo:{" "}
                          {Number(
                            compra.saldo_nuevo ?? 0
                          ).toFixed(2)}{" "}
                          €
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-gray-50 p-6 text-center">
              <p className="text-2xl">🧾</p>

              <p className="mt-2 text-gray-500">
                Todavía no hay compras
                registradas.
              </p>
            </div>
          )}
        </div>

        {/* CANJES RECIENTES */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            🎁 Canjes recientes
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Últimas recompensas entregadas
          </p>

          {canjes && canjes.length > 0 ? (
            <div className="mt-5 space-y-3">
              {canjes
                .slice(0, 10)
                .map((canje) => {
                  const cliente = clientes?.find(
                    (cliente) =>
                      cliente.id ===
                      canje.cliente_id
                  )

                  return (
                    <div
                      key={canje.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          🎁
                        </div>

                        <div>
                          <p className="font-semibold">
                            {canje.recompensa}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Cliente:{" "}
                            {cliente?.nombre ??
                              "Cliente desconocido"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {canje.created_at
                              ? new Date(
                                  canje.created_at
                                ).toLocaleString(
                                  "es-ES"
                                )
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">
                          -{canje.puntos_usados}
                        </p>

                        <p className="text-xs text-gray-500">
                          puntos
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-gray-50 p-6 text-center">
              <p className="text-2xl">🎁</p>

              <p className="mt-2 text-gray-500">
                Todavía no hay canjes registrados.
              </p>
            </div>
          )}
        </div>

        {/* PIE */}

        <div className="py-8 text-center text-xs text-gray-400">
          {negocio.nombre} · {negocio.descripcion} ·
          Piloto
        </div>
      </div>
    </main>
  )
}