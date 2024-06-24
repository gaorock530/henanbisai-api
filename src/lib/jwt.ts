import { TextEncoder } from 'node:util';
import * as jose from 'jose';
import UserInterface from '@/interface/user.interface';
import { HttpException } from '@lib/HttpException';
import log from '@/lib/log';

const alg = 'HS256';

export async function jwtSign(user: UserInterface, sid: string, expire = '24h') {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET + sid);
  try {
    return await new jose.SignJWT({ username: user.username, role: user.role, code: user.promotionCode })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer('hdlovers.com')
      .setAudience('next-client')
      .setExpirationTime(expire)
      .sign(secret);
  } catch (e) {
    throw new HttpException(400, e.toString());
  }
}

export async function jwtVerify(jwt: string, sid: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET + sid);
  try {
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, secret, {
      issuer: 'hdlovers.com',
      audience: 'next-client',
    });
    return { payload, protectedHeader };
  } catch (e) {
    throw new HttpException(401, 'invalid token');
  }
}

export async function generateSign(payload: jose.JWTPayload, seconds = 5 * 60, jwtsecret?: string) {
  try {
    const secret = jose.base64url.decode(jwtsecret || process.env.TOTP_SECRET);
    console.log({ TOTP: process.env.TOTP_SECRET, secret });
    const jwt = await new jose.EncryptJWT(payload)
      .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
      .setIssuedAt()
      .setIssuer('hdlovers.com')
      .setAudience('next-client')
      .setExpirationTime(`${seconds}s`)
      .encrypt(secret);
    return jwt;
  } catch (e) {
    throw new HttpException(400, 'invalid sign action');
  }
}

export async function verifySign(sign: string, jwtsecret?: string) {
  try {
    const secret = jose.base64url.decode(jwtsecret || process.env.TOTP_SECRET);

    const { payload, protectedHeader } = await jose.jwtDecrypt(sign, secret, {
      issuer: 'hdlovers.com',
      audience: 'next-client',
    });
    log({ payload, protectedHeader });
    return { payload, protectedHeader };
  } catch (e) {
    log(e.toString());
    return null;
  }
}
