import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { randomBytes, scryptSync } from "crypto"
import {
  obtenerNombreCookieTerminal,
  sesionTerminalValida,
} from "../../../lib/terminal-auth"

async function autorizado() {
  const cookieStore = await cookies()

  const sesionTerminal = cookieStore.get(
    obtenerNombreCookieTerminal()
  )?.value

  return sesionTerminalValida(sesionTerminal)
}

function obtenerSupabase() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL

  const secretKey =
    process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !secretKey) {
    return null
  }

  return createClient(
    supabaseUrl,
    secretKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

function crearHashPin(pin: string) {
  const salt = randomBytes(16).toString("hex")

  const hash = scryptSync(
    pin,
    salt,
    64
  ).toString("hex")

  return `${salt}:${hash}`
}

export async function GET(request: Request) {
  try {
    if (!(await autorizado())) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const url = new URL(request.url)

    const telefono =
      url.searchParams.get("telefono")?.trim() || ""

    if (!telefono) {
      return NextResponse.json(
        {
          error:
            "Introduzca un número de teléfono.",
        },
        { status: 400 }
      )
    }

    const supabaseAdmin = obtenerSupabase()

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "Configuración del servidor incompleta.",
        },
        { status: 500 }
      )
    }

    const { data: cliente, error } =
      await supabaseAdmin
        .from("id")
        .select("id, nombre, telefono")
        .eq("telefono", telefono)
        .maybeSingle()

    if (error) {
      console.error(
        "Error buscando cliente:",
        error
      )

      return NextResponse.json(
        {
          error:
            "No se pudo buscar al cliente.",
        },
        { status: 500 }
      )
    }

    if (!cliente) {
      return NextResponse.json(
        {
          error:
            "No existe ningún cliente registrado con ese número.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      cliente,
    })
  } catch (error) {
    console.error(
      "Error buscando cliente para PIN:",
      error
    )

    return NextResponse.json(
      {
        error: "Error interno del servidor.",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    if (!(await autorizado())) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { clienteId, nuevoPin } =
      await request.json()

    const id =
      typeof clienteId === "string" ||
      typeof clienteId === "number"
        ? String(clienteId)
        : ""

    const pin =
      typeof nuevoPin === "string"
        ? nuevoPin.trim()
        : ""

    if (!id) {
      return NextResponse.json(
        {
          error: "Cliente no válido.",
        },
        { status: 400 }
      )
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        {
          error:
            "El PIN debe tener exactamente 4 números.",
        },
        { status: 400 }
      )
    }

    const supabaseAdmin = obtenerSupabase()

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "Configuración del servidor incompleta.",
        },
        { status: 500 }
      )
    }

    const pinHash = crearHashPin(pin)

    const { data: cliente, error } =
      await supabaseAdmin
        .from("id")
        .update({
          pin_hash: pinHash,
        })
        .eq("id", id)
        .select("id, nombre")
        .maybeSingle()

    if (error) {
      console.error(
        "Error restableciendo PIN:",
        error
      )

      return NextResponse.json(
        {
          error:
            "No se pudo restablecer el PIN.",
        },
        { status: 500 }
      )
    }

    if (!cliente) {
      return NextResponse.json(
        {
          error: "Cliente no encontrado.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
      },
    })
  } catch (error) {
    console.error(
      "Error en restablecer-pin:",
      error
    )

    return NextResponse.json(
      {
        error: "Error interno del servidor.",
      },
      { status: 500 }
    )
  }
}
