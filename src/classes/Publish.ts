import ResourceInterface from '@/interface/resource.interface';
import { ResourceId, UserId, VideoCategory, AudioCategory, RoleTypes, UrlString, FormatAll, MvCategory, MovieCategory } from '@/interface/types';
import { v4 } from 'uuid';
import { HttpException } from '@/lib/HttpException';
import { publish_reward_blueray, publish_reward_dvd, publish_reward_remux, publish_reward_hires, publish_reward_low } from '@/config/setupProps';

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
  // (optional)
  tags?: string[];
  genres?: string[]; // optional, especially for movies
  artists?: string[];
  year?: string;
  size?: string;
  // resource display information
  content: string;
  coverUrl: UrlString;
  imageUrl: UrlString[];
  // business logic
  reward: number;
  price: number | 0; // fee
  downloadLink: UrlString;
  downloadCode: string;
  // download role permission
  downloadPermission: RoleTypes;
  // orginally from
  originalTitle?: string;
  originalId?: string;
  originalUrl?: UrlString;
  // check validation
  status?: 'published' | 'rejected' | 'accepted';
  rejectReason?: string;
  // for published resource only
  uploadFolder?: string;

  constructor(resourceData: ResourceInterface) {
    this.id = v4();
    this.publishedBy = resourceData.publishedBy;
    this.publishedDate = new Date();
    this.lastEdited = new Date();
    this.title = resourceData.title;
    this.type = resourceData.type;
    this.region = resourceData.region;
    this.format = resourceData.format;
    this.quality = resourceData.quality;
    this.content = resourceData.content;
    this.coverUrl = resourceData.coverUrl;
    this.tags = [];
    this.label = this.getLabel(this.region, this.type, this.format);
    if (!(resourceData.imageUrl instanceof Array)) throw new HttpException(400, 'imageUrl not Array of string');
    this.imageUrl = resourceData.imageUrl;
    this.price = resourceData.price;
    this.downloadLink = resourceData.downloadLink;
    this.downloadCode = resourceData.downloadCode;
    this.reward = this.getReward(this.format);
    this.downloadPermission = 'user:normal';
    if (resourceData.originalTitle) this.originalTitle = resourceData.originalTitle;
    if (resourceData.originalId) this.originalTitle = resourceData.originalId;
    if (resourceData.originalUrl) this.originalTitle = resourceData.originalUrl;
    if (resourceData.uploadFolder) this.uploadFolder = resourceData.uploadFolder;
    this.status = 'published';
  }

  private getReward(format: FormatAll) {
    if (['BDISO', 'BDMV'].includes(format)) return publish_reward_blueray;
    if (['DVDISO'].includes(format)) return publish_reward_dvd;
    if (['REMUX', 'BDRiP', 'WEB-DL', 'HDTV', 'TS', 'M2TS'].includes(format)) return publish_reward_remux;
    if (['ProRes', 'HiRes', 'Master', 'WAV', 'FLAC', 'APE'].includes(format)) return publish_reward_hires;
    if (['MP3', 'ACC', '其他'].includes(format)) return publish_reward_low;
    return 0;
  }

  private getLabel(region: string, type: string, format: string) {
    //type: 'Moive' | 'Concert' | 'MV' | 'Music' | 'Demo';
    //region: '大陆' | '香港' | '台湾' | '欧美' | '日本' | '韩国' | '其他';

    const label = ['', ''];
    if (['大陆', '香港', '台湾'].includes(region)) label[0] = '华语';
    if (region === '欧美') label[0] = '欧美';
    if (region === '日本') label[0] = '日本';
    if (region === '韩国') label[0] = '韩国';

    if (type.toLowerCase() === 'concert') label[1] = '演唱会';
    if (type.toLowerCase() === 'music') {
      label[1] = '音乐';
      if (['BDISO', 'BDMV'].includes(format)) this.tags = this.tags.concat('蓝光音乐');
    }
    if (type.toLowerCase() === 'mv') label[1] = 'MV';
    if (type.toLowerCase() === 'moive') label[1] = '电影';
    if (type.toLowerCase() === 'demo' && ['BDISO', 'BDMV'].includes(format)) {
      label[0] = '蓝光';
      label[1] = '演示碟';
    }
    console.log({ region, type, format, label });

    return label.join('');
  }
}
