import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { negocio } from "../../config/negocio"
import {
  obtenerNombreCookieTerminal,
  sesionTerminalValida,
} from "../../../lib/terminal-auth"

export async function POST(request: Request) {
  try {
    if (!process.env.TERMINAL_SECRET) {
      return NextResponse.json(
        { error: "Terminal no configurado" },
        { status: 500 }
      )
    }

    const cookieStore = await cookies()

    const sesionTerminal = cookieStore.get(
      obtenerNombreCookieTerminal()
    )?.value

    if (!sesionTerminalValida(sesionTerminal)) {
      return NextResponse.json(
        { error: "Terminal no autorizado" },
        { status: 401 }
      )
    }

    const {
      clienteId,
      importe,
      operacionId,
    } = await request.json()

    if (!clienteId) {
      return NextResponse.json(
        { error: "Cliente no válido" },
        { status: 400 }
      )
    }

    if (
      typeof operacionId !== "string" ||
      !operacionId
    ) {
      return NextResponse.json(
        {
          error:
            "Falta el identificador de la operación",
        },
        { status: 400 }
      )
    }

    const importeNumero = Number(importe)

    if (
      !Number.isFinite(importeNumero) ||
      importeNumero <= 0
    ) {
      return NextResponse.json(
        { error: "Introduzca un importe válido" },
        { status: 400 }
      )
    }

    const eurosPorPunto =
      negocio.fidelizacion.eurosPorPunto

    if (
      !Number.isFinite(eurosPorPunto) ||
      eurosPorPunto <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "La configuración de fidelización no es válida",
        },
        { status: 500 }
      )
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL

    const secretKey =
      process.env.SUPABASE_SECRET_KEY

    if (!supabaseUrl || !secretKey) {
      return NextResponse.json(
        {
          error:
            "Configuración del servidor incompleta",
        },
        { status: 500 }
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

    const { data, error } =
      await supabaseAdmin.rpc(
        "registrar_compra",
        {
          p_cliente_id: clienteId,
          p_importe: importeNumero,
          p_euros_por_punto: eurosPorPunto,
          p_operacion_id: operacionId,
        }
      )

    if (error) {
      console.error(
        "Error registrando compra:",
        error
      )

      return NextResponse.json(
        {
          error:
            "No se pudo registrar la compra",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      resultado: data,
    })
  } catch (error) {
    console.error(
      "Error en registrar-puntos-compra:",
      error
    )

    return NextResponse.json(
      {
        error: "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}