export const negocio = {
  nombre: "ANCLA KEBAB",
  descripcion: "Programa de fidelización",
  eslogan: "Tus compras tienen recompensa",

  fidelizacion: {
    eurosPorPunto: 5,
    acumularSaldoSobrante: true,
  },

  recompensas: [
    {
      id: "bebida-pincho",
      nombre: "Bebida + pincho gratis",
      puntosNecesarios: 10,
    },
    {
      id: "kebab-gratis",
      nombre: "Kebab gratis",
      puntosNecesarios: 20,
    },
  ],

  contacto: {
    telefono: "",
    email: "",
    direccion: "",
  },

  apariencia: {
    logo: "/logo.png",
  },
}