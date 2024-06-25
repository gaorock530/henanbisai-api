import { v4 } from 'uuid';
import { UserId } from '@/interface/types';

export default class Transaction {
  id: string;
  topupBy: UserId;
  topupDate: Date;
  transactionId: string;
  paymentDetail: any;
  amount: number;
  platform: 'alipay' | 'wechat';
  usage: 'normal' | 'month' | 'year' | 'forever';
  status: 'start' | 'paid' | 'error';

  constructor({ topupBy, transactionId, paymentDetail, amount, amountString, platform, usage }) {
    this.id = v4();
    this.topupDate = new Date();
    this.topupBy = topupBy;
    this.transactionId = transactionId;
    this.paymentDetail = paymentDetail;
    this.amount = amount;
    this.platform = platform;
    this.usage = usage;
    this.status = 'start';
  }
}
