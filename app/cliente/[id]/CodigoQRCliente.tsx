"use client"

import { QRCodeSVG } from "qrcode.react"

export default function CodigoQRCliente({
  clienteId,
}: {
  clienteId: string
}) {
  return (
    <div className="flex justify-center">
      <div className="rounded-2xl bg-white p-4">
        <QRCodeSVG
          value={clienteId}
          size={220}
          level="M"
          includeMargin
        />
      </div>
    </div>
  )
}