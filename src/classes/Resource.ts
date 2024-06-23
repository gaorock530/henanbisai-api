import ResourceInterface from '@/interface/resource.interface';
import { ResourceId, UserId, VideoCategory, AudioCategory, RoleTypes, UrlString, FormatAll, MvCategory, MovieCategory } from '@/interface/types';
import { HttpException } from '@/lib/HttpException';

export default class Resource implements ResourceInterface {
  id: ResourceId;
  publishedBy: UserId;
  publishedDate: Date;
  lastEdited: Date;
  // categorize resource
  title: string;
  type: 'Moive' | 'Concert' | 'MV' | 'Music' | 'Demo';
  region: '大陆' | '香港' | '台湾' | '欧美' | '日本' | '韩国' | '其他';
  format: FormatAll;
  quality: '8K' | '4K' | '2K' | '1080p' | '720p' | '480p' | 'LosslessAudio' | 'CompressedAudio' | '其他';
  label?: VideoCategory | AudioCategory | MovieCategory | MvCategory | string;
  tags?: string[];
  // (optional)
  artists?: string[];
  year?: string;
  size?: string;
  genres?: string[]; // optional, especially for movies
  // resource display information
  content: string;
  coverUrl: UrlString;
  imageUrl: UrlString[];
  backupCoverUrl?: UrlString;
  backupImageUrl?: UrlString[];
  // business logic
  price: number | 0; // fee
  downloadCount: number | 0;
  popularity: number | 0; // download * rnd()
  downloadLink: UrlString;
  downloadCode: string;
  backupDownloadLink?: UrlString;
  backupDownloadCode?: string;
  promotionStatus?: boolean;
  promotionPrice?: number;
  promotionPeriod?: [Date, Date];
  // download role permission
  downloadPermission: RoleTypes;
  // orginally from
  originalTitle?: string;
  originalId?: string;
  originalUrl?: UrlString;
  status?: 'normal' | 'error' | 'fixed';

  constructor(resourceData: ResourceInterface) {
    this.id = resourceData.id;
    this.publishedBy = resourceData.publishedBy;
    this.publishedDate = resourceData.publishedDate;
    this.lastEdited = resourceData.lastEdited;
    this.title = resourceData.title;
    this.type = resourceData.type;
    this.region = resourceData.region;
    this.format = resourceData.format;
    this.quality = resourceData.quality;
    this.content = resourceData.content;
    this.coverUrl = resourceData.coverUrl;
    if (!(resourceData.imageUrl instanceof Array)) throw new HttpException(400, 'imageUrl not Array of string');
    this.imageUrl = resourceData.imageUrl;
    this.price = Number(resourceData.price) || 0;
    this.downloadLink = resourceData.downloadLink;
    this.downloadCode = resourceData.downloadCode;
    this.backupCoverUrl = resourceData.backupCoverUrl;
    this.backupImageUrl = resourceData.backupImageUrl;
    this.downloadCount = 0;
    this.popularity = 0;
    this.downloadPermission = resourceData.downloadPermission;
    this.status = 'normal';
    if (resourceData.originalTitle) this.originalTitle = resourceData.originalTitle;
    if (resourceData.originalId) this.originalTitle = resourceData.originalId;
    if (resourceData.originalUrl) this.originalTitle = resourceData.originalUrl;
    if (resourceData.label) this.label = resourceData.label;
    if (resourceData.tags) this.tags = resourceData.tags;
    if (resourceData.artists) this.artists = resourceData.artists;
    if (resourceData.year) this.year = resourceData.year;
    if (resourceData.size) this.size = resourceData.size;
    if (resourceData.genres) this.genres = resourceData.genres;
  }
}
