import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@lib/HttpException';
import AuthService from '@/service/auth.service';
import log from '@/lib/log';

class AuthController {
  public authService = new AuthService();

  public test = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sid = req.query['sid'].toString();
      const { name, pass } = req.body;
      log('auth.controller.ts [login] =>', req.body);
      if (!name) throw new HttpException(400, 'name');
      if (!pass) throw new HttpException(400, 'pass');
      // checking sign from 'register action', compare 'payload'
      const { sid: signSid, action, value: signValue } = req['sign'];
      if (action !== 'login') throw new HttpException(400, 'action');
      if (sid !== signSid) throw new HttpException(400, 'sid');
      if (signValue !== name + pass) throw new HttpException(400, 'signValue');

      // check login
      const loginRes = await this.authService.test(name);
      res.json(loginRes);
    } catch (error) {
      console.log({ error });
      next(error);
    }
  };
}

export default AuthController;
