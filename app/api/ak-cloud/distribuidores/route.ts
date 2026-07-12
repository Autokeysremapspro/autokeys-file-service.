import { NextResponse } from 'next/server'

// La gestión de solicitudes pertenece exclusivamente a Autokeys Core.
// Esta ruta se bloquea en AK Cloud para impedir acceso administrativo desde el portal público.
export async function GET() {
  return NextResponse.json({ error: 'Ruta administrativa disponible solo en Autokeys Core' }, { status: 403 })
}

export async function POST() {
  return NextResponse.json({ error: 'Ruta administrativa disponible solo en Autokeys Core' }, { status: 403 })
}
