"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

import {
  crearSesionTerminal,
  obtenerNombreCookieTerminal,
  pinTerminalValido,
} from "../../lib/terminal-auth"

const MAX_INTENTOS = 5
const MINUTOS_BLOQUEO = 15

function crearSupabaseAdmin() {
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

export async function iniciarSesionTerminal(
  pin: string
) {
  if (!process.env.TERMINAL_SECRET) {
    return {
      ok: false,
      error: "Terminal no configurado",
    }
  }

  const supabaseAdmin = crearSupabaseAdmin()

  if (!supabaseAdmin) {
    return {
      ok: false,
      error:
        "Configuración del servidor incompleta",
    }
  }

  const { data: control, error: errorControl } =
    await supabaseAdmin
      .from("intentos_terminal")
      .select(
        "intentos_fallidos, bloqueado_hasta"
      )
      .eq("id", 1)
      .single()

  if (errorControl || !control) {
    console.error(
      "Error leyendo intentos del terminal:",
      errorControl
    )

    return {
      ok: false,
      error:
        "No se pudo comprobar la seguridad del terminal",
    }
  }

  if (control.bloqueado_hasta) {
    const bloqueadoHasta = new Date(
      control.bloqueado_hasta
    )

    if (bloqueadoHasta.getTime() > Date.now()) {
      const minutosRestantes = Math.max(
        1,
        Math.ceil(
          (bloqueadoHasta.getTime() -
            Date.now()) /
            60000
        )
      )

      return {
        ok: false,
        error:
          `Demasiados intentos incorrectos. ` +
          `Espere ${minutosRestantes} minuto${
            minutosRestantes === 1 ? "" : "s"
          }.`,
      }
    }

    await supabaseAdmin
      .from("intentos_terminal")
      .update({
        intentos_fallidos: 0,
        bloqueado_hasta: null,
        actualizado_en:
          new Date().toISOString(),
      })
      .eq("id", 1)
  }

  if (!pinTerminalValido(pin)) {
    const nuevosIntentos =
      Number(control.intentos_fallidos ?? 0) + 1

    if (nuevosIntentos >= MAX_INTENTOS) {
      const bloqueadoHasta = new Date(
        Date.now() +
          MINUTOS_BLOQUEO * 60 * 1000
      )

      const { error } = await supabaseAdmin
        .from("intentos_terminal")
        .update({
          intentos_fallidos: MAX_INTENTOS,
          bloqueado_hasta:
            bloqueadoHasta.toISOString(),
          actualizado_en:
            new Date().toISOString(),
        })
        .eq("id", 1)

      if (error) {
        console.error(
          "Error bloqueando terminal:",
          error
        )
      }

      return {
        ok: false,
        error:
          `Demasiados intentos incorrectos. ` +
          `Terminal bloqueado durante ${MINUTOS_BLOQUEO} minutos.`,
      }
    }

    const { error } = await supabaseAdmin
      .from("intentos_terminal")
      .update({
        intentos_fallidos: nuevosIntentos,
        bloqueado_hasta: null,
        actualizado_en:
          new Date().toISOString(),
      })
      .eq("id", 1)

    if (error) {
      console.error(
        "Error actualizando intentos:",
        error
      )
    }

    const restantes =
      MAX_INTENTOS - nuevosIntentos

    return {
      ok: false,
      error:
        `Clave incorrecta. ` +
        `Quedan ${restantes} intento${
          restantes === 1 ? "" : "s"
        }.`,
    }
  }

  const { error: errorReinicio } =
    await supabaseAdmin
      .from("intentos_terminal")
      .update({
        intentos_fallidos: 0,
        bloqueado_hasta: null,
        actualizado_en:
          new Date().toISOString(),
      })
      .eq("id", 1)

  if (errorReinicio) {
    console.error(
      "Error reiniciando intentos:",
      errorReinicio
    )
  }

  const cookieStore = await cookies()

  cookieStore.set(
    obtenerNombreCookieTerminal(),
    crearSesionTerminal(),
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 12,
    }
  )

  return { ok: true }
}

export async function cerrarSesionTerminal() {
  const cookieStore = await cookies()

  cookieStore.delete(
    obtenerNombreCookieTerminal()
  )

  redirect("/terminal/login")
}