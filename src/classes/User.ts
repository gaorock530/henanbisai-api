import { v4 } from 'uuid';
import nanoid from '@/lib/nanoid';
import { UserId, RoleTypes, UrlString } from '@/interface/types';
import bcrypt from 'bcrypt';
import UserInterface from '@/interface/user.interface';

export default class User implements UserInterface {
  id: UserId;
  username: string;
  usernameForCheck: string;
  password: string;
  phone?: string;
  email?: string;
  avatar?: UrlString;
  avatarFileId?: string;
  registerDate: Date;
  registeredBy: 'phone' | 'email';
  status: 'normal' | 'inactive' | 'frozen' | 'banned';
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

  constructor(registerData: any) {
    this.id = v4();
    this.username = registerData.username;
    this.usernameForCheck = registerData.username.toLowerCase();
    this.email = registerData.type === 'email' ? registerData.value : null;
    this.phone = registerData.type === 'phone' ? registerData.value : null;
    this.avatar = '';
    this.registerDate = new Date();
    this.registeredBy = registerData.type;
    this.status = 'normal';
    this.role = 'user:normal';
    this.abnormalCounter = 0;
    this.abnormalBehaivor = null;
    this.abnormalStartToFinish = null;
    this.promotionCode = nanoid();
    this.promotionCodeUsed = registerData.invitecode;
    this.vip = false;
    this.vipStartToFinish = null;
    this.coins = 0;
    this.points = Number(process.env.INITIAL_POINTS) || 0;
    this.dailySignin = null;
    this.dailyOpenSite = null;
    this.dailyWatchDetail = null;
    this.lastQuestionAskedDate = null;
    this.incomingMessage = false;

    this.init(registerData.password);
  }

  private async init(password: string) {
    this.password = await bcrypt.hash(password, 10);
  }
}
