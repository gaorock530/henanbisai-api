import { ResourceId, UserId, VideoCategory, AudioCategory, RoleTypes, UrlString, FormatAll, MovieCategory, MvCategory } from './types';

export default interface ResourceInterface {
  id?: ResourceId;
  publishedBy: UserId;
  publishedDate?: Date;
  lastEdited?: Date;
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
  downloadCount?: number | 0;
  popularity?: number | 0; // download * rnd()
  downloadLink?: UrlString;
  downloadCode: string;
  backupDownloadLink?: UrlString;
  backupDownloadCode?: string;
  promotionStatus?: boolean;
  promotionPrice?: number;
  promotionPeriod?: [Date, Date];
  // download role permission
  downloadPermission?: RoleTypes;
  // orginally from
  originalTitle?: string;
  originalId?: string;
  originalUrl?: UrlString;
  // check validation
  status?: 'normal' | 'error' | 'fixed' | 'banned' | 'forze' | 'published' | 'rejected' | 'accepted';
  // for published resource only
  uploadFolder?: string;
}
