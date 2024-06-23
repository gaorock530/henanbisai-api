import { RoleTypes } from '@/interface/types';
import Resource from '@/classes/Resource';

export function isSameAsToday(date: string) {
  const now = new Date().toISOString();
  const the = new Date(date).toISOString();
  return now.slice(0, 10) === the.slice(0, 10);
}

export const roles = ['user:normal', 'user:month', 'user:year', 'user:forever', 'admin:normal', 'admin:owner'];

export function isVIPValid(vipStartToFinish: [Date, Date] | [Date, null] | null) {
  const now = new Date();
  if (!vipStartToFinish) return false;
  const [start, finish] = vipStartToFinish;
  if (!start) return false;
  if (finish === null) return true;
  if (start <= now && finish > now) return true;
  return false;
}

export function isRoleBiggerOrEqual(role: RoleTypes, targetRole: RoleTypes) {
  const indexOfRole = roles.indexOf(role);
  const indexOfTargetRole = roles.indexOf(targetRole);
  return indexOfRole >= indexOfTargetRole;
}

export function isPromotion(resource: Resource): number | false {
  if (!resource.promotionStatus) return false;
  if (!resource.promotionPeriod) return false;
  const [begin, finish] = resource.promotionPeriod;
  const now = new Date();
  if (begin > now || finish <= now) return false;
  return resource.price;
}

export function isValidParam(str: string) {
  return typeof str === 'undefined' || str.length <= 1000;
}
