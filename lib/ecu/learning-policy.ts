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
  requiresHumanDecisionTrace: true,
  requiresHumanReviewerTrace: true,
  requiresHumanDecisionTimestamp: true,
  invalidInputsFailClosed: true,
} as const)

export type EcuLearningEligibility = {
  eligible: boolean
  reason:
    | 'clear_for_learning'
    | 'blocked_by_review_items'
    | 'awaiting_human_confirmation'
    | 'missing_human_decision_trace'
    | 'missing_human_reviewer_trace'
    | 'missing_human_decision_timestamp'
    | 'invalid_human_decision_timestamp'
    | 'invalid_review_item_count'
  reviewItemCount: number
  humanConfirmed: boolean
  humanDecisionId: string | null
  humanReviewerId: string | null
  humanDecisionAt: string | null
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
  humanDecisionId?: string | null,
  humanReviewerId?: string | null,
  humanDecisionAt?: string | null,
): EcuLearningEligibility {
  const hasValidReviewItemCount =
    Number.isFinite(reviewItemCount) &&
    Number.isInteger(reviewItemCount) &&
    reviewItemCount >= 0

  const safeReviewItemCount = hasValidReviewItemCount ? reviewItemCount : 1
  const hasNoReviewItems = hasValidReviewItemCount && safeReviewItemCount === 0
  const normalizedDecisionId =
    typeof humanDecisionId === 'string' ? humanDecisionId.trim() : ''
  const normalizedReviewerId =
    typeof humanReviewerId === 'string' ? humanReviewerId.trim() : ''
  const normalizedDecisionAt =
    typeof humanDecisionAt === 'string' ? humanDecisionAt.trim() : ''
  const hasHumanDecisionTrace = normalizedDecisionId.length > 0
  const hasHumanReviewerTrace = normalizedReviewerId.length > 0
  const hasHumanDecisionTimestamp = normalizedDecisionAt.length > 0
  const parsedHumanDecisionTimestamp = hasHumanDecisionTimestamp
    ? Date.parse(normalizedDecisionAt)
    : Number.NaN
  const hasValidHumanDecisionTimestamp =
    hasHumanDecisionTimestamp && Number.isFinite(parsedHumanDecisionTimestamp)
  const isHumanConfirmed = humanConfirmed === true
  const eligible =
    hasNoReviewItems &&
    isHumanConfirmed &&
    hasHumanDecisionTrace &&
    hasHumanReviewerTrace &&
    hasValidHumanDecisionTimestamp

  let reason: EcuLearningEligibility['reason'] = 'clear_for_learning'
  if (!hasValidReviewItemCount) reason = 'invalid_review_item_count'
  else if (!hasNoReviewItems) reason = 'blocked_by_review_items'
  else if (!isHumanConfirmed) reason = 'awaiting_human_confirmation'
  else if (!hasHumanDecisionTrace) reason = 'missing_human_decision_trace'
  else if (!hasHumanReviewerTrace) reason = 'missing_human_reviewer_trace'
  else if (!hasHumanDecisionTimestamp) reason = 'missing_human_decision_timestamp'
  else if (!hasValidHumanDecisionTimestamp) reason = 'invalid_human_decision_timestamp'

  return {
    eligible,
    reason,
    reviewItemCount: safeReviewItemCount,
    humanConfirmed: isHumanConfirmed,
    humanDecisionId: hasHumanDecisionTrace ? normalizedDecisionId : null,
    humanReviewerId: hasHumanReviewerTrace ? normalizedReviewerId : null,
    humanDecisionAt: hasValidHumanDecisionTimestamp ? normalizedDecisionAt : null,
    policyVersion: ECU_LEARNING_POLICY.policyVersion,
    decisionAuthority: ECU_LEARNING_POLICY.decisionAuthority,
  }
}
