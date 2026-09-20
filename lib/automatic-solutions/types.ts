export const AUTOMATIC_SOLUTION_PRICE = 44.9
export const AUTOMATIC_SOLUTION_BUCKET = 'ak-auto-solutions'
export const AUTOMATIC_SOLUTION_MAX_BYTES = 64 * 1024 * 1024
export const AUTOMATIC_SOLUTION_LEGAL_VERSION = 'AK-AUTO-2026-09-20'

export type AutomaticSolutionStatus = 'draft' | 'testing' | 'verified' | 'published' | 'retired'
export type AutomaticPaymentProvider = 'sumup' | 'paypal'

export type AutomaticSolution = {
  id: string
  name: string
  service_code: string
  service_name: string
  ecu: string
  hw: string | null
  sw: string | null
  vehicle_notes: string | null
  ori_sha256: string
  ori_size: number
  ori_name: string
  mod_sha256: string
  mod_size: number
  mod_name: string
  price: number
  status: AutomaticSolutionStatus
  verification_suite: Record<string, boolean | string | number | null>
  verified_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

