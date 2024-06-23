import { UserId, RoleTypes, UrlString } from './types';

export default interface UserInterface {
  id: UserId;
  username: string;
  usernameForCheck: string;
  password: string;
  phone?: string;
  email?: string;
  avatar?: UrlString;
  registerDate: Date;
  registeredBy: 'phone' | 'email';
  status: 'normal' | 'inactive' | 'frozen' | 'banned' | 'unsubscribe';
  role: RoleTypes;
  abnormalCounter: number | 0;
  abnormalBehaivor: 'bot' | 'stolen' | 'transaction' | null;
  abnormalStartToFinish: [Date, Date] | [Date, null] | null;
  promotionCode: string;
  promotionCodeUsed: string | 'buy' | null;
  vip: 'month' | 'year' | 'forever' | false;
  vipStartToFinish: [Date, Date] | [Date, null] | null;
  coins: number | 0;
  points: number | 0;
  dailySignin: Date | null;
  dailyOpenSite: Date | null;
  dailyWatchDetail: Date | null; // this only happens when user look into item details
  lastQuestionAskedDate: Date | null;
  incomingMessage: boolean;
}
