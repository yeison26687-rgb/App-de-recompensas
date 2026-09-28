import Link from "next/link"
import { negocio } from "../config/negocio"

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-black">
      <div className="mx-auto max-w-2xl">

        <Link
          href="/registro"
          className="text-sm font-semibold"
        >
          ← Volver al registro
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            {negocio.nombre}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Política de Privacidad
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Información sobre el tratamiento de datos
            del programa de fidelización.
          </p>

          <div className="mt-8 space-y-8 text-sm leading-7 text-gray-700">

            <section>
              <h2 className="text-lg font-bold text-black">
                1. Finalidad
              </h2>

              <p className="mt-2">
                Los datos facilitados por el usuario
                se utilizan para gestionar su
                participación en el programa de
                fidelización de {negocio.nombre},
                incluyendo la creación y gestión de
                su cuenta, identificación mediante
                código QR, acumulación de puntos,
                insignias, recompensas, canjes y
                registro de operaciones vinculadas
                al programa.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black">
                2. Datos tratados
              </h2>

              <p className="mt-2">
                El programa puede tratar los datos
                proporcionados durante el registro,
                como nombre, teléfono y, cuando se
                facilite, correo electrónico, así
                como la información generada por el
                uso del programa de fidelización.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black">
                3. Seguridad
              </h2>

              <p className="mt-2">
                Se aplican medidas técnicas y
                organizativas destinadas a proteger
                la información frente a accesos,
                alteraciones, pérdidas o usos no
                autorizados.
              </p>

              <p className="mt-2">
                El PIN utilizado para acceder a la
                tarjeta no se almacena directamente
                como texto legible por el sistema.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black">
                4. Ofertas y promociones
              </h2>

              <p className="mt-2">
                El envío de ofertas, promociones y
                novedades mediante los datos de
                contacto facilitados se realizará
                cuando el usuario haya seleccionado
                voluntariamente la opción
                correspondiente.
              </p>

              <p className="mt-2">
                La aceptación de comunicaciones
                promocionales no es necesaria para
                participar en el programa de
                fidelización.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black">
                5. Retirada del consentimiento comercial
              </h2>

              <p className="mt-2">
                El usuario podrá solicitar en
                cualquier momento dejar de recibir
                ofertas y comunicaciones
                promocionales, sin que ello implique
                perder su cuenta, sus puntos o sus
                recompensas.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black">
                6. Conservación de los datos
              </h2>

              <p className="mt-2">
                Los datos se conservarán mientras
                sean necesarios para gestionar la
                participación del usuario en el
                programa y durante los plazos que
                resulten aplicables para atender las
                obligaciones correspondientes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black">
                7. Derechos del usuario
              </h2>

              <p className="mt-2">
                El usuario podrá solicitar, cuando
                corresponda, el acceso,
                rectificación o supresión de sus
                datos, así como ejercer sus derechos
                de oposición, limitación y
                portabilidad conforme a la
                normativa aplicable.
              </p>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-bold text-black">
                Información del responsable
              </h2>

              <p className="mt-2">
                Los datos identificativos y de
                contacto completos del responsable
                del tratamiento se incorporarán a
                esta política antes de la
                implantación comercial definitiva
                del servicio.
              </p>
            </section>

          </div>

          <Link
            href="/registro"
            className="mt-8 block w-full rounded-xl bg-black py-4 text-center font-bold text-white"
          >
            ← Volver al registro
          </Link>

        </div>
      </div>
    </main>
  )
}
