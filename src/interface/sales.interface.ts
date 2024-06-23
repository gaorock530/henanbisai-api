import { ResourceId, UserId, UrlString } from './types';

export default interface SalesInterface {
  id?: string;
  purchasedBy: UserId;
  purchaseDate?: Date;
  originalPrice: number;
  purchasePrice: number;
  transactionId?: string;
  resourceId: ResourceId;
  resourceLink: UrlString;
  promotionCode?: string;
  title: string;
  error?: boolean;
}
