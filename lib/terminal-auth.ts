import { createHmac, timingSafeEqual } from "crypto"

const COOKIE_NAME = "terminal_session"

function obtenerTerminalSecret() {
  return process.env.TERMINAL_SECRET
}

function crearFirma(secret: string) {
  return createHmac("sha256", secret)
    .update("ancla-terminal-session-v1")
    .digest("hex")
}

export function obtenerNombreCookieTerminal() {
  return COOKIE_NAME
}

export function crearSesionTerminal() {
  const secret = obtenerTerminalSecret()

  if (!secret) {
    throw new Error("Terminal no configurado")
  }

  return crearFirma(secret)
}

export function sesionTerminalValida(
  valorCookie: string | undefined
) {
  const secret = obtenerTerminalSecret()

  if (!secret || !valorCookie) {
    return false
  }

  const firmaEsperada = crearFirma(secret)

  const recibida = Buffer.from(valorCookie)
  const esperada = Buffer.from(firmaEsperada)

  if (recibida.length !== esperada.length) {
    return false
  }

  return timingSafeEqual(recibida, esperada)
}

export function pinTerminalValido(pin: string) {
  const secret = obtenerTerminalSecret()

  if (!secret || !pin) {
    return false
  }

  const recibido = Buffer.from(pin)
  const esperado = Buffer.from(secret)

  if (recibido.length !== esperado.length) {
    return false
  }

  return timingSafeEqual(recibido, esperado)
}