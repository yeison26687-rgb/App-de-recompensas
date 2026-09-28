"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { negocio } from "../config/negocio"

export default function TerminalLector() {
  const [codigo, setCodigo] = useState("")
  const [escaneando, setEscaneando] =
    useState(false)
  const [errorCamara, setErrorCamara] =
    useState("")

  const lectorRef = useRef<Html5Qrcode | null>(
    null
  )

  function abrirCliente(valor: string) {
    const texto = valor.trim()

    const esUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        texto
      )

    // QR que contiene solamente el ID
    if (esUuid) {
      window.location.href = `/terminal/${texto}`
      return
    }

    // Compatibilidad con QR antiguo que contenga URL
    try {
      const url = new URL(texto)

      const partes = url.pathname
        .split("/")
        .filter(Boolean)

      let clienteId = ""

      if (
        partes.length === 2 &&
        (partes[0] === "cliente" ||
          partes[0] === "terminal")
      ) {
        clienteId = partes[1]
      }

      const idValido =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          clienteId
        )

      if (!idValido) {
        alert("QR no válido")
        setCodigo("")
        return
      }

      window.location.href =
        `/terminal/${clienteId}`
    } catch {
      alert("QR no válido")
      setCodigo("")
    }
  }

  async function detenerCamara() {
    if (lectorRef.current) {
      try {
        if (lectorRef.current.isScanning) {
          await lectorRef.current.stop()
        }

        lectorRef.current.clear()
      } catch {
        // No hacemos nada si ya estaba detenida
      }

      lectorRef.current = null
    }

    setEscaneando(false)
  }

  async function iniciarCamara() {
    setErrorCamara("")

    try {
      setEscaneando(true)

      // Esperamos a que React cree el contenedor
      await new Promise((resolve) =>
        setTimeout(resolve, 100)
      )

      const lector = new Html5Qrcode(
        "lector-qr-camara"
      )

      lectorRef.current = lector

      await lector.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (textoDecodificado) => {
          await detenerCamara()
          abrirCliente(textoDecodificado)
        },
        () => {
          // Ignoramos los intentos de lectura
          // mientras busca un QR.
        }
      )
    } catch (error) {
      console.error(
        "Error iniciando cámara:",
        error
      )

      setEscaneando(false)

      setErrorCamara(
        "No se pudo abrir la cámara. Compruebe los permisos del navegador."
      )
    }
  }

  useEffect(() => {
    return () => {
      if (
        lectorRef.current &&
        lectorRef.current.isScanning
      ) {
        lectorRef.current
          .stop()
          .catch(() => {})
      }
    }
  }, [])

  return (
    <main className="min-h-screen bg-white p-6 text-black">
      <div className="mx-auto max-w-md text-center">

        <h1 className="text-3xl font-bold">
          {negocio.nombre}
        </h1>

        <h2 className="mt-8 text-2xl font-bold">
          Terminal de validación
        </h2>

        <p className="mt-4 text-gray-500">
          Esperando lectura del QR...
        </p>

        {/* LECTOR FÍSICO */}

        <input
          type="text"
          value={codigo}
          onChange={(e) =>
            setCodigo(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              abrirCliente(codigo)
            }
          }}
          autoFocus={!escaneando}
          placeholder="Escanee el QR del cliente"
          className="mt-8 w-full rounded-xl border p-4 text-center"
        />

        <p className="mt-4 text-sm text-gray-400">
          O utilice la cámara del dispositivo
        </p>

        {/* CÁMARA */}

        {!escaneando ? (
          <button
            type="button"
            onClick={iniciarCamara}
            className="mt-4 w-full rounded-xl bg-black py-4 font-semibold text-white"
          >
            📷 Escanear QR con cámara
          </button>
        ) : (
          <button
            type="button"
            onClick={detenerCamara}
            className="mt-4 w-full rounded-xl border py-4 font-semibold"
          >
            Cancelar escaneo
          </button>
        )}

        {escaneando && (
          <div className="mt-6 overflow-hidden rounded-2xl border p-2">
            <div
              id="lector-qr-camara"
              className="w-full"
            />
          </div>
        )}

        {errorCamara && (
          <p className="mt-4 text-sm font-semibold text-red-600">
            {errorCamara}
          </p>
        )}
        <div className="mt-8 border-t pt-6">
  <button
    type="button"
    onClick={() => {
      window.location.href = "/admin"
    }}
    className="w-full rounded-xl border border-black py-4 font-semibold"
  >
    📊 Panel de administración
  </button>
</div>

      </div>
    </main>
  )
}