import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get("id")

    if (!clienteId) {
      return NextResponse.json(
        { error: "Falta el cliente" },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const secretKey = process.env.SUPABASE_SECRET_KEY

    if (!supabaseUrl || !secretKey) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta" },
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

    const { data: cliente, error } = await supabaseAdmin
      .from("id")
      .select("id, nombre, puntos")
      .eq("id", clienteId)
      .single()

    if (error || !cliente) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: cliente.id,
      nombre: cliente.nombre,
      puntos: cliente.puntos ?? 0,
    })
  } catch (error) {
    console.error("Error consultando cliente:", error)

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}