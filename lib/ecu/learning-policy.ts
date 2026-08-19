export const ECU_LEARNING_POLICY = Object.freeze({
  policyVersion: 3,
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
  requiresIso8601DecisionTimestamp: true,
  requiresCalendarValidDecisionTimestamp: true,
  invalidInputsFailClosed: true,
} as const)

const ISO_8601_TIMESTAMP_WITH_ZONE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/

function hasValidCalendarDate(timestamp: string): boolean {
  const match = ISO_8601_TIMESTAMP_WITH_ZONE.exec(timestamp)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])

  if (month < 1 || month > 12) return false
  if (hour < 0 || hour > 23) return false
  if (minute < 0 || minute > 59) return false
  if (second < 0 || second > 59) return false

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return day >= 1 && day <= daysInMonth
}

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
  const hasStrictIso8601Timestamp =
    hasHumanDecisionTimestamp && ISO_8601_TIMESTAMP_WITH_ZONE.test(normalizedDecisionAt)
  const hasCalendarValidTimestamp =
    hasStrictIso8601Timestamp && hasValidCalendarDate(normalizedDecisionAt)
  const parsedHumanDecisionTimestamp = hasCalendarValidTimestamp
    ? Date.parse(normalizedDecisionAt)
    : Number.NaN
  const hasValidHumanDecisionTimestamp =
    hasCalendarValidTimestamp && Number.isFinite(parsedHumanDecisionTimestamp)
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
