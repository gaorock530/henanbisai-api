import { Router } from 'express';
import PayController from '@/controller/pay.controller';
import { RoutesInterface } from '@interface/router.interface';
// import checkSign from '@middleware/auth.middleware';
// import checkUser from '@/middleware/user.middleware';
// import { limiter } from '@/lib/limiter';

class PayRoute implements RoutesInterface {
  public path = '/pay';
  public router = Router();
  public payController = new PayController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get(`${this.path}/alipay`, limiter(3, 60), this.payController.alipay);
    this.router.get(`${this.path}/alipay_callback`, this.payController.alipay_callback);
    this.router.get(`${this.path}/wepay_callback`, this.payController.wepay_callback);
    this.router.post(`${this.path}/alipay_notice`, this.payController.alipay_notice);
  }
}

export default PayRoute;
