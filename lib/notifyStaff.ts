import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppNotification } from '@/lib/whatsapp'
import { sendNotificationEmail } from '@/lib/email'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function coreUrl(path: string) {
  return process.env.NEXT_PUBLIC_CORE_URL ? `${process.env.NEXT_PUBLIC_CORE_URL}${path}` : path
}

/**
 * Avisa a Core (autokeys-lab) de que ha entrado un pedido nuevo en AK Cloud.
 * Se llama desde los tres sitios donde un pedido pasa a existir de verdad:
 * el alta gratuita en crear/route.ts, y la confirmación de pago en
 * paypal.ts / sumup.ts. Sin esto, un pedido nuevo se creaba bien en la
 * base de datos pero nadie del staff se enteraba salvo que entrara a
 * /ak-cloud por su cuenta — igual que pasaba antes con las solicitudes de
 * distribuidor, que sí tienen este mismo aviso.
 */
export async function notificarNuevoPedido(pedido: {
  id: string
  numero?: string | null
  cliente_nombre?: string | null
  servicios?: string[] | null
  precio_final?: number | null
  precio?: number | null
}) {
  try {
    const admin = adminClient()
    const importe = Number(pedido.precio_final ?? pedido.precio ?? 0)
    const servicios = Array.isArray(pedido.servicios) ? pedido.servicios.join(', ') : ''
    const referencia = pedido.numero ? `#${pedido.numero}` : pedido.id

    await admin.from('notificaciones').insert({
      usuario_id: null,
      titulo: 'Nuevo pedido AK Cloud',
      mensaje: `${referencia} · ${pedido.cliente_nombre || 'Cliente'} · ${servicios}${importe > 0 ? ` · ${importe.toFixed(2)} €` : ''}`,
      modulo: 'ak_cloud',
      tipo: 'info',
      prioridad: 'normal',
      href: '/ak-cloud',
      accion_texto: 'Ver pedido',
      // event_type: 'pedido_nuevo' es el que ya escucha el trigger
      // trg_akcore_dispatch_web_push sobre notificaciones — sin esto la fila
      // se crea igual pero nunca llega el push real (móvil / pestaña cerrada).
      metadata: { event_key: `akcloud-order-${pedido.id}`, event_type: 'pedido_nuevo', pedido_id: pedido.id },
    })

    await sendWhatsAppNotification(
      `🆕 Nuevo pedido AK Cloud\n${referencia} · ${pedido.cliente_nombre || 'Cliente'}\n${servicios}${importe > 0 ? `\nImporte: ${importe.toFixed(2)} €` : ''}\n\nVer: ${coreUrl('/ak-cloud')}`
    )

    if (process.env.STAFF_NOTIFICATION_EMAIL) {
      await sendNotificationEmail({
        to: process.env.STAFF_NOTIFICATION_EMAIL,
        subject: `Nuevo pedido AK Cloud: ${referencia}`,
        title: 'Nuevo pedido AK Cloud',
        bodyHtml: `<b>${referencia}</b> · ${pedido.cliente_nombre || 'Cliente'}<br>${servicios}${importe > 0 ? `<br>Importe: ${importe.toFixed(2)} €` : ''}`,
        ctaHref: coreUrl('/ak-cloud'),
        ctaLabel: 'Ver pedido',
      })
    }
  } catch (error) {
    // Best-effort: un fallo avisando al staff no debe romper la creación del pedido ya pagado.
    console.error('No se pudo notificar el nuevo pedido a Core:', error)
  }
}

/**
 * Avisa a Core de un ticket de soporte nuevo, o de un mensaje nuevo del
 * cliente en un ticket ya abierto. Mismo motivo que notificarNuevoPedido:
 * sin esto, un distribuidor podía escribir y nadie del staff se enteraba
 * hasta entrar a /ak-cloud/soporte a mirar.
 */
export async function notificarSoporte(input: {
  ticketId: string
  numero?: string | null
  asunto?: string | null
  empresa?: string | null
  mensaje: string
  esNuevoTicket: boolean
}) {
  try {
    const admin = adminClient()
    const referencia = input.numero ? `#${input.numero}` : input.ticketId
    const titulo = input.esNuevoTicket ? 'Nuevo ticket de soporte' : 'Nuevo mensaje en ticket de soporte'
    const asunto = input.asunto ? ` · ${input.asunto}` : ''

    await admin.from('notificaciones').insert({
      usuario_id: null,
      titulo,
      mensaje: `${referencia}${asunto}${input.empresa ? ` · ${input.empresa}` : ''} · ${input.mensaje.slice(0, 180)}`,
      modulo: 'ak_cloud',
      tipo: input.esNuevoTicket ? 'warning' : 'info',
      prioridad: input.esNuevoTicket ? 'alta' : 'normal',
      href: `/ak-cloud/soporte?ticket=${input.ticketId}`,
      accion_texto: 'Abrir ticket',
      // 'mensaje_cliente' es el event_type más cercano de los que ya escucha
      // trg_akcore_dispatch_web_push (lo usa file_service_mensajes) — así este
      // aviso también dispara push real, no solo el toast en pestaña abierta.
      metadata: { event_key: `akcloud-ticket-${input.ticketId}-${Date.now()}`, event_type: 'mensaje_cliente', ticket_id: input.ticketId },
    })

    await sendWhatsAppNotification(
      `🎫 ${titulo}\n${referencia}${asunto}${input.empresa ? `\n${input.empresa}` : ''}\n${input.mensaje.slice(0, 300)}\n\nVer: ${coreUrl(`/ak-cloud/soporte?ticket=${input.ticketId}`)}`
    )

    if (process.env.STAFF_NOTIFICATION_EMAIL) {
      await sendNotificationEmail({
        to: process.env.STAFF_NOTIFICATION_EMAIL,
        subject: `${titulo}: ${referencia}`,
        title: titulo,
        bodyHtml: `<b>${referencia}</b>${asunto}${input.empresa ? `<br>${input.empresa}` : ''}<br><br>${input.mensaje}`,
        ctaHref: coreUrl(`/ak-cloud/soporte?ticket=${input.ticketId}`),
        ctaLabel: 'Abrir ticket',
      })
    }
  } catch (error) {
    console.error('No se pudo notificar el ticket de soporte a Core:', error)
  }
}
