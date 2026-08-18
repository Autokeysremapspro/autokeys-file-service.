export const ECU_LEARNING_POLICY = Object.freeze({
  requiresHumanDecision: true,
  autoPromote: false,
  autoFix: false,
  modifiesEcuFiles: false,
  allowsFuzzyIdentityMatching: false,
  requiresZeroReviewItems: true,
} as const)

export type EcuLearningEligibility = {
  eligible: boolean
  reason: 'clear_for_learning' | 'blocked_by_review_items'
  reviewItemCount: number
}

/**
 * Pure safety gate for ECU learning.
 *
 * This helper never identifies an ECU, fixes a rule, promotes knowledge or
 * modifies an ECU file. It only answers whether already-reviewed knowledge is
 * eligible to be consumed by learning.
 */
export function evaluateEcuLearningEligibility(reviewItemCount: number): EcuLearningEligibility {
  const safeReviewItemCount = Number.isFinite(reviewItemCount)
    ? Math.max(0, Math.trunc(reviewItemCount))
    : 1

  const eligible = safeReviewItemCount === 0

  return {
    eligible,
    reason: eligible ? 'clear_for_learning' : 'blocked_by_review_items',
    reviewItemCount: safeReviewItemCount,
  }
}
