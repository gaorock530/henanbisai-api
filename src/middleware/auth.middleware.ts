import { NextFunction, Request, Response } from 'express';
import { verifySign } from '@/lib/jwt';

export default async (req: Request, res: Response, next: NextFunction) => {
  // in cloudflare, not support cross origin 'mode, credentials', so instand of using 'headers'
  // switch using 'search params'

  try {
    const sid = req.query['sid'];
    const sign = req.headers['x-sign']?.toString();
    if (!sid || !sign) throw Error('!sid || !sign Warning');
    const { payload } = await verifySign(sign);
    if (payload.sid !== sid) throw Error('Unauthorized');
    req['sign'] = payload;
    next();
  } catch (e) {
    res.status(403).send(e.message);
  }
};
