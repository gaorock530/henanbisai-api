import ContactInterface from '@/interface/contact.interface';
import { UserId } from '@interface/types';
import { v4 } from 'uuid';

export default class Contact implements ContactInterface {
  id: string;
  contactedBy: UserId;
  contactedUser: string;
  contactedDate: Date;
  type: string; //'提问' | '建议' | '报错' | '投诉';
  text: string;
  url?: string;
  reply?: string;
  repliedBy?: UserId;
  repliedUsername?: string;
  repliedDate?: Date;

  constructor(data: ContactInterface) {
    this.id = v4();
    this.contactedBy = data.contactedBy;
    this.contactedUser = data.contactedUser;
    this.contactedDate = new Date();
    this.type = data.type;
    this.text = data.text;
    if (data.url) this.url = data.url;
  }
}
