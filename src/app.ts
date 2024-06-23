import express from 'express';
import DB from '@instance/database';
// import fs from 'fs';
// import path from 'path';
// import https from 'https';
import { NODE_ENV, PORT } from '@config';
import { RoutesInterface } from '@interface/router.interface';
import errorMiddleware from '@/middleware/error.middleware';
// import commonMiddleware from '@/middleware/common.middleware';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

export default class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: RoutesInterface[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 8001;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public async start() {
    await DB.connect();
    // const server = https.createServer(
    //   {
    //     key: fs.readFileSync(path.resolve(__dirname, '../assets/ssl/code.key')),
    //     cert: fs.readFileSync(path.resolve(__dirname, '../assets/ssl/code.crt')),
    //   },
    //   this.app
    // )
    this.app.get('/', (req, res) => {
      res.send('welcome!!!!');
    });

    this.app.listen(this.port, () => {
      console.log(`===================================`);
      console.log(`======= ENV: ${this.env} ==========`);
      console.log(`🚀 App listening on the port: ${this.port}`);
      console.log(`===================================`);
    });
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    // this.app.use(cors({ origin: ORIGIN, credentials: true, allowedHeaders: 'x-sign,x-sid' }));
    // this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    // this.app.use(cookieParser());
    this.app.set('x-powered-by', false);
    // check totp for every request
    // define it yourself
    // this.app.use(commonMiddleware);
  }

  private initializeRoutes(routes: RoutesInterface[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  public getServer() {
    return this.app;
  }
}
