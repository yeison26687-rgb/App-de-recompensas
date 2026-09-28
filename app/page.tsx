import Link from "next/link"
import { negocio } from "./config/negocio"

export default function Home() {
  return (
    <main className="min-h-screen bg-white p-6 text-black">
      <div className="mx-auto max-w-md text-center">

        <h1 className="text-3xl font-bold">
          {negocio.nombre}
        </h1>

        <p className="mt-4 text-gray-500">
          {negocio.descripcion}
        </p>

        <p className="mt-2 text-sm text-gray-400">
          {negocio.eslogan}
        </p>

        <div className="mt-10 space-y-4">

          <Link
            href="/registrar-compra"
            className="block w-full rounded-xl bg-black py-4 font-semibold text-white"
          >
            Registrar cliente
          </Link>

          <Link
            href="/terminal"
            className="block w-full rounded-xl border border-black py-4 font-semibold"
          >
            Terminal de validación
          </Link>

        </div>
      </div>
    </main>
  )
}