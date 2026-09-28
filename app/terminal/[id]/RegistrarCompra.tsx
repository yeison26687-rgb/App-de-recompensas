"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

export default function RegistrarCompra({
  clienteId,
}: {
  clienteId: string
}) {
  const [importe, setImporte] = useState("")
  const [procesando, setProcesando] =
    useState(false)
  const [mensaje, setMensaje] = useState("")

  const operacionIdRef = useRef<string | null>(
    null
  )

  const router = useRouter()

  async function registrarCompra() {
    /*
      Si ya hay una operación en curso o pendiente
      de confirmación, reutilizamos exactamente
      el mismo identificador.

      Así, si la petición se repite por un problema
      de red, la base de datos puede reconocerla.
    */
    if (!operacionIdRef.current) {
      operacionIdRef.current =
        crypto.randomUUID()
    }

    const operacionId =
      operacionIdRef.current

    const importeNumero = Number(
      importe.replace(",", ".")
    )

    if (
      !Number.isFinite(importeNumero) ||
      importeNumero <= 0
    ) {
      setMensaje(
        "❌ Introduzca un importe válido"
      )
      operacionIdRef.current = null
      return
    }

    setProcesando(true)
    setMensaje("")

    try {
      const respuesta = await fetch(
        "/api/registrar-puntos-compra",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            clienteId,
            importe: importeNumero,
            operacionId,
          }),
        }
      )

      const resultado =
        await respuesta.json()

      if (
        !respuesta.ok ||
        !resultado.ok
      ) {
        setMensaje(
          `❌ ${
            resultado.error ||
            "No se pudo registrar la compra"
          }`
        )

        setProcesando(false)

        /*
          Conservamos operacionId.

          Si el servidor sí llegó a procesar la
          compra pero la respuesta se perdió,
          un nuevo intento utilizará el mismo ID
          y no volverá a sumar puntos.
        */
        return
      }

      const datos = resultado.resultado

      if (datos.duplicada) {
        setMensaje(
          `✅ Esta compra ya había sido registrada. ` +
            `No se han duplicado los puntos. ` +
            `Total: ${datos.puntos_totales} puntos. ` +
            `Saldo acumulado: ${Number(
              datos.saldo_euros
            ).toFixed(2)} €`
        )
      } else {
        setMensaje(
          `✅ Compra registrada. ` +
            `+${datos.puntos_sumados} puntos. ` +
            `Total: ${datos.puntos_totales} puntos. ` +
            `Saldo acumulado: ${Number(
              datos.saldo_euros
            ).toFixed(2)} €`
        )
      }

      setImporte("")

      /*
        La operación terminó correctamente.
        El próximo registro debe recibir
        un identificador completamente nuevo.
      */
      operacionIdRef.current = null

      setProcesando(false)
      router.refresh()
    } catch {
      setMensaje(
        "❌ No se pudo conectar con el servidor. Puede volver a intentarlo."
      )

      /*
        NO borramos operacionId aquí.

        Si el servidor llegó a registrar la compra
        antes de perderse la conexión, el siguiente
        intento reutilizará el mismo identificador.
      */
      setProcesando(false)
    }
  }

  return (
    <div className="mt-6 rounded-xl border p-4">
      <p className="font-bold">
        💶 Registrar compra
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Introduzca el importe pagado por el cliente.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={importe}
          onChange={(e) => {
            setImporte(e.target.value)

            /*
              Si el usuario modifica el importe,
              consideramos que está preparando
              una operación diferente.
            */
            operacionIdRef.current = null
          }}
          placeholder="Ej. 17,50"
          disabled={procesando}
          className="min-w-0 flex-1 rounded-xl border p-4 text-center text-lg"
        />

        <span className="text-xl font-bold">
          €
        </span>
      </div>

      <button
        type="button"
        onClick={registrarCompra}
        disabled={procesando || !importe}
        className="mt-4 w-full rounded-xl bg-black py-4 font-semibold text-white disabled:opacity-50"
      >
        {procesando
          ? "Registrando..."
          : "Registrar compra"}
      </button>

      {mensaje && (
        <p className="mt-4 text-sm font-semibold">
          {mensaje}
        </p>
      )}
    </div>
  )
}