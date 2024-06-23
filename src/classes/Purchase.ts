import SalesInterface from '@/interface/sales.interface';
import { v4 } from 'uuid';
// import { nanoid } from 'nanoid';
import { UserId, ResourceId, UrlString } from '@/interface/types';

export default class Purchase implements SalesInterface {
  id: string;
  purchasedBy: UserId;
  purchaseDate: Date;
  originalPrice: number;
  purchasePrice: number;
  transactionId: string;
  resourceId: ResourceId;
  resourceLink: UrlString;
  title: string;
  promotionCode?: string;
  error?: boolean;

  constructor({ purchasedBy, resourceId, resourceLink, title, originalPrice, purchasePrice, promotionCode }) {
    this.id = v4();
    this.purchasedBy = purchasedBy;
    this.purchaseDate = new Date();
    this.originalPrice = originalPrice;
    this.purchasePrice = purchasePrice;
    this.transactionId = v4();
    this.resourceId = resourceId;
    this.resourceLink = resourceLink;
    this.title = title;
    if (promotionCode) this.promotionCode = promotionCode;
  }
}
