import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient, requireStaff } from '@/lib/supabase/server'
import {
  AUTOMATIC_SOLUTION_BUCKET,
  AUTOMATIC_SOLUTION_MAX_BYTES,
} from './types'

export function automaticSolutionsEnabled() {
  return process.env.AK_AUTO_SOLUTIONS_ENABLED === 'true'
}

export function automaticSolutionsAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Falta la configuración privada de Supabase')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function requireAutomaticSolutionsUser() {
  if (!automaticSolutionsEnabled()) throw new Error('Módulo no disponible')
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')
  return user
}

export async function requireAutomaticSolutionsStaff() {
  return requireStaff()
}

export function safeFileName(value: string) {
  const clean = value.trim().replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120)
  if (!clean || clean === '.' || clean === '..') throw new Error('Nombre de archivo no válido')
  return clean
}

export function validateFileDescriptor(name: string, size?: number) {
  const safeName = safeFileName(name)
  if (size !== undefined && (!Number.isFinite(size) || size <= 0 || size > AUTOMATIC_SOLUTION_MAX_BYTES)) {
    throw new Error('El archivo debe pesar entre 1 byte y 64 MB')
  }
  const extension = safeName.split('.').pop()?.toLowerCase()
  if (!extension || !['bin', 'ori', 'hex', 'mod'].includes(extension)) {
    throw new Error('Formato no compatible. Usa .bin, .ori, .hex o .mod')
  }
  return safeName
}

export async function hashStoredFile(path: string) {
  const admin = automaticSolutionsAdmin()
  const { data, error } = await admin.storage.from(AUTOMATIC_SOLUTION_BUCKET).download(path)
  if (error || !data) throw new Error(error?.message || 'No se pudo leer el archivo privado')
  if (data.size <= 0 || data.size > AUTOMATIC_SOLUTION_MAX_BYTES) throw new Error('Tamaño de archivo no permitido')
  const buffer = Buffer.from(await data.arrayBuffer())
  return {
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
    size: buffer.length,
  }
}

export async function createPrivateUpload(path: string) {
  const admin = automaticSolutionsAdmin()
  const { data, error } = await admin.storage
    .from(AUTOMATIC_SOLUTION_BUCKET)
    .createSignedUploadUrl(path)
  if (error || !data) throw new Error(error?.message || 'No se pudo preparar la subida privada')
  return data
}

export async function auditAutomaticSolution(input: {
  actorUserId?: string | null
  solutionId?: string | null
  orderId?: string | null
  action: string
  metadata?: Record<string, string | number | boolean | null>
}) {
  const admin = automaticSolutionsAdmin()
  await admin.from('ak_auto_solution_audit').insert({
    actor_user_id: input.actorUserId || null,
    solution_id: input.solutionId || null,
    order_id: input.orderId || null,
    action: input.action.slice(0, 80),
    metadata: input.metadata || {},
  })
}

export function automaticSolutionErrorStatus(error: unknown) {
  const message = error instanceof Error ? error.message : 'Error inesperado'
  if (message === 'No autorizado') return 401
  if (message === 'Módulo no disponible') return 404
  return 400
}
