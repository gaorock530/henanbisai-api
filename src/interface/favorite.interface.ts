import { FormatAll } from '@/interface/types';
export default interface FavoriteInterface {
  userId: string;
  resourceId: string;
  date?: Date;
  title: string;
  type: 'Moive' | 'Concert' | 'MV' | 'Music' | 'Demo';
  region: '大陆' | '香港' | '台湾' | '欧美' | '日本' | '韩国' | '其他';
  format: FormatAll;
  quality: '8K' | '4K' | '2K' | '1080p' | '720p' | '480p' | 'LosslessAudio' | 'CompressedAudio' | '其他';
  url: string;
}
