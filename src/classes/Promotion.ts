import { RoleTypes } from '@/interface/types';

export default class Promotion {
  code: string;
  expires: number | string;
  issueDate: Date;
  type: 'ponits' | 'coins';
  amount: number;
  apply: RoleTypes | 'all';

  constructor({ expires, type, amount, apply }: { expires: number | string; type: 'ponits' | 'coins'; amount: number; apply?: RoleTypes | 'all' }) {
    this.code = '123123';
  }
}
