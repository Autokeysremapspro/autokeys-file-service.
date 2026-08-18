export const ECU_LEARNING_POLICY = Object.freeze({
  requiresHumanDecision: true,
  autoPromote: false,
  autoFix: false,
  modifiesEcuFiles: false,
  allowsFuzzyIdentityMatching: false,
  requiresZeroReviewItems: true,
  requiresExplicitHumanConfirmation: true,
} as const)

export type EcuLearningEligibility = {
  eligible: boolean
  reason: 'clear_for_learning' | 'blocked_by_review_items' | 'awaiting_human_confirmation'
  reviewItemCount: number
  humanConfirmed: boolean
}

/**
 * Pure safety gate for ECU learning.
 *
 * This helper never identifies an ECU, fixes a rule, promotes knowledge or
 * modifies an ECU file. It only answers whether already-reviewed knowledge is
 * eligible to be consumed by learning.
 */
export function evaluateEcuLearningEligibility(
  reviewItemCount: number,
  humanConfirmed = false,
): EcuLearningEligibility {
  const safeReviewItemCount = Number.isFinite(reviewItemCount)
    ? Math.max(0, Math.trunc(reviewItemCount))
    : 1

  const hasNoReviewItems = safeReviewItemCount === 0
  const eligible = hasNoReviewItems && humanConfirmed === true

  let reason: EcuLearningEligibility['reason'] = 'clear_for_learning'
  if (!hasNoReviewItems) reason = 'blocked_by_review_items'
  else if (!humanConfirmed) reason = 'awaiting_human_confirmation'

  return {
    eligible,
    reason,
    reviewItemCount: safeReviewItemCount,
    humanConfirmed: humanConfirmed === true,
  }
}
