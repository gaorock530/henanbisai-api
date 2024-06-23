import { MD5 } from 'crypto-js';
import log from '@/lib/log';

export function getTOTP(seconds = 5, value?: Object): string {
  const local_totp = Math.floor(Date.now() / 1000 / seconds);
  let stuff = local_totp + (process.env.TOTP_SECRET || '');
  if (value) stuff = stuff + JSON.stringify(value);
  const hash = MD5(stuff).toString();
  return hash;
}

export function checkTOTP(totp: string, seconds = 5, value?: Object) {
  const hash = getTOTP(seconds, value);
  log({ hash, totp });
  return totp === hash;
}

export function testTotp() {
  const totp = getTOTP(120, { test: 1, value: 2 });
  return checkTOTP(totp, 120, { test: 1, value: 2 });
}
