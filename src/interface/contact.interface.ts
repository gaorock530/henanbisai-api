import { UserId } from './types';

export default interface ContactInterface {
  id?: string;
  contactedBy: UserId;
  contactedUser: string;
  contactedDate?: Date;
  type: string; //'提问' | '建议' | '报错' | '投诉';
  text: string;
  url?: string;
  reply?: string;
  repliedBy?: UserId;
  repliedUsername?: string;
  repliedDate?: Date;
}
