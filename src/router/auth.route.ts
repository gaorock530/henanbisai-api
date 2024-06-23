import { Router } from 'express';
import AuthController from '@/controller/auth.controller';
import { RoutesInterface } from '@interface/router.interface';
import checkSign from '@middleware/auth.middleware';
// import checkUser from '@/middleware/user.middleware';
import { limiter } from '@/lib/limiter';

class AuthRoute implements RoutesInterface {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/test`, limiter(3, 60), checkSign, this.authController.test);
  }
}

export default AuthRoute;
