import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { randomBytes, scryptSync } from "crypto"

function crearHashPin(pin: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(pin, salt, 64).toString("hex")

  return `${salt}:${hash}`
}

export async function POST(request: Request) {
  try {
    const { nombre, telefono, email, pin } =
      await request.json()

    const nombreLimpio =
      typeof nombre === "string" ? nombre.trim() : ""

    const telefonoLimpio =
      typeof telefono === "string" ? telefono.trim() : ""

    const emailLimpio =
      typeof email === "string" ? email.trim() : ""

    const pinLimpio =
      typeof pin === "string" ? pin.trim() : ""

    if (!nombreLimpio || !telefonoLimpio) {
      return NextResponse.json(
        {
          error:
            "El nombre y el teléfono son obligatorios.",
        },
        { status: 400 }
      )
    }

    if (!/^\d{4}$/.test(pinLimpio)) {
      return NextResponse.json(
        {
          error:
            "El PIN debe tener exactamente 4 números.",
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

    const { data: existente } =
      await supabaseAdmin
        .from("id")
        .select("id")
        .eq("telefono", telefonoLimpio)
        .maybeSingle()

    if (existente) {
      return NextResponse.json(
        {
          error:
            "Este teléfono ya está registrado. Utiliza «Ya soy cliente».",
        },
        { status: 409 }
      )
    }

    const pinHash = crearHashPin(pinLimpio)

    const { data, error } =
      await supabaseAdmin
        .from("id")
        .insert({
          nombre: nombreLimpio,
          telefono: telefonoLimpio,
          email: emailLimpio || null,
          puntos: 0,
          pin_hash: pinHash,
        })
        .select("id, nombre, puntos")
        .single()

    if (error) {
      console.error(
        "Error registrando cliente:",
        error
      )

      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "Este teléfono ya está registrado.",
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        {
          error:
            "No se pudo crear tu tarjeta.",
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
      "Error en registro-publico:",
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
