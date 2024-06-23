import DB from '@instance/database';
import { HttpException } from '@lib/HttpException';
import log from '@/lib/log';

export default class PayService {
  public async test(data: any) {
    try {
      // const userCollection = DB.db('users').collection('user');
      // const user: any = await userCollection.findOne(
      //   { usernameForCheck: username.toLowerCase() },
      //   {
      //     projection: {
      //       username: 1,
      //       password: 1,
      //       avatar: 1,
      //       status: 1,
      //       vip: 1,
      //       role: 1,
      //       promotionCode: 1,
      //     },
      //   },
      // );
      // log({ user });

      return { data };
    } catch (err) {
      throw new HttpException(err.status || 503, err.message || err.toString());
    }
  }
}
