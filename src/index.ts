import App from './app';
import AuthRoute from '@/router/auth.route';
import PayRoute from '@/router/pay.route';

const app = new App([new AuthRoute(), new PayRoute()]);

app.start();

console.log('Start Date:', new Date());
console.log({
  'process.env.JWT_SECRET': process.env.JWT_SECRET,
  'process.env.SIGN_SECRET': process.env.SIGN_SECRET,
  'process.env.TOTP_SECRET': process.env.TOTP_SECRET,
});
