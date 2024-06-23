import { UserId, ImageId, ImageFileId } from './types';

export default interface ImageInterface {
  id: ImageId;
  imageFileId: ImageFileId;
  name: string;
  url: string;
  uploadedDate: Date;
  uploadedBy: UserId;
  deleted: boolean;
  backupImgaeId: ImageId | null;
  backupImageFileId: ImageFileId | null;
  backupUrl: string | null;
}
