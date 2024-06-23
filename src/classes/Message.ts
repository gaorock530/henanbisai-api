import MessageInterface from '@/interface/message.interface';
import { UserId } from '@/interface/types';
import { v4 } from 'uuid';

export default class Message implements MessageInterface {
  id: string;
  sender?: string; // username
  receiver: UserId;
  date: Date;
  /**
   * @enum {system} lock, warn, violation, event
   * @enum {answer} answer to user question
   * @enum {reward} notice user gain ponits
   */
  type: 'system' | 'answer' | 'reward' | 'charge';
  refer?: string;
  message: string;
  read: boolean;

  constructor(entry: any) {
    this.id = v4();
    if (entry.sender) this.sender = entry.sender;
    this.receiver = entry.receiver;
    this.date = new Date();
    this.type = entry.type;
    this.message = entry.message;
    this.read = false;
    if (entry.refer) this.refer = entry.refer;
  }
}
