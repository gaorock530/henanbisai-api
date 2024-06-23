import { UserId } from './types';

export default interface AskInterface {
  id: string;
  by: UserId;
  askingDate: Date;
  content: string;
  type: 'question' | 'suggestion' | 'issue';
  isReplyed: false;
  replyDate: Date | null;
}
