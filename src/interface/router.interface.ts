import { Router } from 'express';

export interface RoutesInterface {
  path?: string;
  router: Router;
}
