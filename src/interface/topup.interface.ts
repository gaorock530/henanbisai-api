import { UserId } from './types';

export default interface TopupInterface {
  id: string;
  topupBy: UserId;
  topupDate: Date;
  transactionId: string;
  paymentDetail?: any;
  amount: number;
  platform: 'alipay' | 'wechat';
  usage: 'normal' | 'month' | 'year' | 'forever';
  status: 'start' | 'paid' | 'error';
}
