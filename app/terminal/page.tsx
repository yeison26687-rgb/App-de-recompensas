import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import TerminalLector from "./TerminalLector"
import {
  obtenerNombreCookieTerminal,
  sesionTerminalValida,
} from "../../lib/terminal-auth"

export default async function TerminalPage() {
  const cookieStore = await cookies()

  const sesionTerminal = cookieStore.get(
    obtenerNombreCookieTerminal()
  )?.value

  if (!sesionTerminalValida(sesionTerminal)) {
    redirect("/terminal/login")
  }

  return <TerminalLector />
}