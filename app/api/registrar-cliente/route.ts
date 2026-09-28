import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
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
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { nombre, telefono, email } =
      await request.json()

    const nombreLimpio =
      typeof nombre === "string"
        ? nombre.trim()
        : ""

    const telefonoLimpio =
      typeof telefono === "string"
        ? telefono.trim()
        : ""

    const emailLimpio =
      typeof email === "string"
        ? email.trim()
        : ""

    if (!nombreLimpio || !telefonoLimpio) {
      return NextResponse.json(
        {
          error:
            "El nombre y el teléfono son obligatorios.",
        },
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
      await supabaseAdmin
        .from("id")
        .insert({
          nombre: nombreLimpio,
          telefono: telefonoLimpio,
          email: emailLimpio || null,
          puntos: 0,
        })
        .select("id, nombre, puntos")
        .single()

    if (error) {
      console.error(
        "Error registrando cliente:",
        error
      )

      return NextResponse.json(
        {
          error:
            "No se pudo registrar el cliente",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      cliente: data,
    })
  } catch (error) {
    console.error(
      "Error en registrar-cliente:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}