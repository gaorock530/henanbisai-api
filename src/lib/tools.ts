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

export function checkPass(password: string) {
  let secureLevel = 0;
  // Minimum eight characters, at least one letter and one number:
  if (password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,128}$/)) secureLevel = 1;
  // Minimum eight characters, at least one letter, one number and one special character
  if (
    password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,128}$/) ||
    // Minimum eight characters, at least one uppercase letter, one lowercase letter and one number
    password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,128}$/)
  )
    secureLevel = 2;
  // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special characte
  // /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/
  if (
    password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W])[A-Za-z\d\W]{8,128}$/) ||
    // Minimum eight and maximum 10 characters, at least one uppercase letter, one lowercase letter, one number and one special character
    password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W])[A-Za-z\d\W]{8,128}$/)
  )
    secureLevel = 3;
  return secureLevel;
}

export function generateTradeNo() {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth().toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const mid = String(date.getTime()).slice(1);
  const rand = String(Math.random()).slice(-6);
  return `${year}${month}${day}${mid}${rand}`;
}
