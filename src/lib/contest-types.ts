/**
 * 比赛类型常量，对应后端定义
 * @see /sastoj/pkg/util/contest_type.go
 */
export const CONTEST_TYPES = {
  IOI: 1,
  ACM: 2,
  FRESH_CUP: 3,
} as const;

export type ContestType = (typeof CONTEST_TYPES)[keyof typeof CONTEST_TYPES];

/**
 * 获取赛制类型的名称
 */
export function getContestTypeName(type: number | null | undefined): string {
  if (type === CONTEST_TYPES.IOI) return 'IOI';
  if (type === CONTEST_TYPES.ACM) return 'ACM';
  if (type === CONTEST_TYPES.FRESH_CUP) return 'FreshCup';
  return 'Practice';
}
