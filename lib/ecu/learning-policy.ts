export const ECU_LEARNING_POLICY = Object.freeze({
  policyVersion: 1,
  decisionAuthority: 'laboratory_human',
  requiresHumanDecision: true,
  autoPromote: false,
  autoFix: false,
  modifiesEcuFiles: false,
  allowsFuzzyIdentityMatching: false,
  requiresZeroReviewItems: true,
  requiresExplicitHumanConfirmation: true,
  invalidInputsFailClosed: true,
} as const)

export type EcuLearningEligibility = {
  eligible: boolean
  reason:
    | 'clear_for_learning'
    | 'blocked_by_review_items'
    | 'awaiting_human_confirmation'
    | 'invalid_review_item_count'
  reviewItemCount: number
  humanConfirmed: boolean
  policyVersion: typeof ECU_LEARNING_POLICY.policyVersion
  decisionAuthority: typeof ECU_LEARNING_POLICY.decisionAuthority
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
  const hasValidReviewItemCount =
    Number.isFinite(reviewItemCount) &&
    Number.isInteger(reviewItemCount) &&
    reviewItemCount >= 0

  const safeReviewItemCount = hasValidReviewItemCount ? reviewItemCount : 1
  const hasNoReviewItems = hasValidReviewItemCount && safeReviewItemCount === 0
  const eligible = hasNoReviewItems && humanConfirmed === true

  let reason: EcuLearningEligibility['reason'] = 'clear_for_learning'
  if (!hasValidReviewItemCount) reason = 'invalid_review_item_count'
  else if (!hasNoReviewItems) reason = 'blocked_by_review_items'
  else if (!humanConfirmed) reason = 'awaiting_human_confirmation'

  return {
    eligible,
    reason,
    reviewItemCount: safeReviewItemCount,
    humanConfirmed: humanConfirmed === true,
    policyVersion: ECU_LEARNING_POLICY.policyVersion,
    decisionAuthority: ECU_LEARNING_POLICY.decisionAuthority,
  }
}
