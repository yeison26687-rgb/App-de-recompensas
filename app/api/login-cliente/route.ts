import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { scryptSync, timingSafeEqual } from "crypto"

function comprobarPin(
  pin: string,
  pinGuardado: string
) {
  try {
    const [salt, hashGuardado] =
      pinGuardado.split(":")

    if (!salt || !hashGuardado) {
      return false
    }

    const hashCalculado = scryptSync(
      pin,
      salt,
      64
    )

    const hashOriginal = Buffer.from(
      hashGuardado,
      "hex"
    )

    if (
      hashCalculado.length !==
      hashOriginal.length
    ) {
      return false
    }

    return timingSafeEqual(
      hashCalculado,
      hashOriginal
    )
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { telefono, pin } =
      await request.json()

    const telefonoLimpio =
      typeof telefono === "string"
        ? telefono.trim()
        : ""

    const pinLimpio =
      typeof pin === "string"
        ? pin.trim()
        : ""

    if (
      !telefonoLimpio ||
      !/^\d{4}$/.test(pinLimpio)
    ) {
      return NextResponse.json(
        {
          error:
            "Teléfono o PIN incorrectos.",
        },
        { status: 401 }
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
            "Configuración del servidor incompleta.",
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

    const { data: cliente, error } =
      await supabaseAdmin
        .from("id")
        .select(
          "id, nombre, telefono, pin_hash"
        )
        .eq("telefono", telefonoLimpio)
        .maybeSingle()

    if (
      error ||
      !cliente ||
      !cliente.pin_hash
    ) {
      return NextResponse.json(
        {
          error:
            "Teléfono o PIN incorrectos.",
        },
        { status: 401 }
      )
    }

    const pinCorrecto = comprobarPin(
      pinLimpio,
      cliente.pin_hash
    )

    if (!pinCorrecto) {
      return NextResponse.json(
        {
          error:
            "Teléfono o PIN incorrectos.",
        },
        { status: 401 }
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
      "Error en login-cliente:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Error interno del servidor.",
      },
      { status: 500 }
    )
  }
}
