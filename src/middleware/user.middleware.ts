import { NextFunction, Request, Response } from 'express';
import { jwtVerify } from '@/lib/jwt';
import DB from '@instance/database';

export default async (req: Request, res: Response, next: NextFunction) => {
  // in cloudflare, not support cross origin 'mode, credentials', so instand of using 'headers'
  // switch using 'search params'

  try {
    const sid = req.query['sid']?.toString();
    const token = req.headers['x-token']?.toString();
    if (!sid) throw Error('sid Warning');
    if (!token) throw Error('Token');
    const { payload: tokenPayload } = await jwtVerify(token, sid);
    const isResetPassword = req.url.toLowerCase().includes('/user/resetpassword');
    // find user
    if (!tokenPayload.username) throw Error('Invalid Token');
    const condition: Record<string, number> = {
      _id: 0,
      usernameForCheck: 0,
    };

    if (!isResetPassword) condition.password = 0;

    const userCollection = DB.db('users').collection('user');
    const user = await userCollection.findOne(
      { usernameForCheck: tokenPayload.username.toString().toLowerCase() },
      {
        projection: condition,
      },
    );
    if (!user) throw Error('Invalid Token');
    req['user'] = user;
    next();
  } catch (e) {
    res.status(403).send(e.message);
  }
};
