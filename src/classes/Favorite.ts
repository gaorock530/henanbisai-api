import FavoriteInterface from '@/interface/favorite.interface';
import { FormatAll } from '@/interface/types';

export default class Favorite implements FavoriteInterface {
  userId: string;
  resourceId: string;
  date: Date;
  title: string;
  type: 'Moive' | 'Concert' | 'MV' | 'Music' | 'Demo';
  region: '大陆' | '香港' | '台湾' | '欧美' | '日本' | '韩国' | '其他';
  format: FormatAll;
  quality: '8K' | '4K' | '2K' | '1080p' | '720p' | '480p' | 'LosslessAudio' | 'CompressedAudio' | '其他';
  url: string;

  constructor(data: FavoriteInterface) {
    this.userId = data.userId;
    this.resourceId = data.resourceId;
    this.date = new Date();
    this.title = data.title;
    this.type = data.type;
    this.region = data.region;
    this.format = data.format;
    this.quality = data.quality;
    this.url = data.url;
  }
}
