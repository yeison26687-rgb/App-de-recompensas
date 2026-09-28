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

    const { clienteId, recompensaId } =
      await request.json()

    if (!clienteId) {
      return NextResponse.json(
        { error: "Falta el cliente" },
        { status: 400 }
      )
    }

    if (!recompensaId) {
      return NextResponse.json(
        { error: "Falta la recompensa" },
        { status: 400 }
      )
    }

    const recompensa = negocio.recompensas.find(
      (item) => item.id === recompensaId
    )

    if (!recompensa) {
      return NextResponse.json(
        { error: "Recompensa no válida" },
        { status: 400 }
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
        "canjear_recompensa",
        {
          p_cliente_id: clienteId,
          p_recompensa_id: recompensaId,
        }
      )

    if (error) {
      console.error(
        "Error canjeando recompensa:",
        error
      )

      const mensaje =
        error.message?.includes(
          "Puntos insuficientes"
        )
          ? "El cliente no tiene suficientes puntos"
          : error.message?.includes(
                "Recompensa no válida"
              )
            ? "Recompensa no válida"
            : "No se pudo realizar el canje"

      return NextResponse.json(
        { error: mensaje },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      resultado: data,
    })
  } catch (error) {
    console.error(
      "Error en canjear-recompensa:",
      error
    )

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}