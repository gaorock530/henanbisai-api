import { UserId } from './types';

export default interface MessageInterface {
  id: string;
  sender?: UserId;
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
}
