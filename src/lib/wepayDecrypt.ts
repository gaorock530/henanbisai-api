// import { createDecipheriv } from 'node:crypto';
const _crypto = require('node:crypto');
const V3_KEY = 'asdlkj123Akkj321Poaskqw1278DasFB';

// export default function wepayDecrypt(ciphertext: string, nonce: string, associated_data: string) {
//   const encrypted = Buffer.from(ciphertext, 'base64');
//   const decipher = createDecipheriv('AES-256-GCM', V3_KEY, nonce);

//   decipher.setAuthTag(encrypted.slice(-16));
//   decipher.setAAD(Buffer.from(associated_data));

//   let output = Buffer.concat([decipher.update(encrypted.slice(0, -16)), decipher.final()]);

//   return output.toString();
// }
export default function wepayDecrypt(ciphertext: string, nonce: string, associated_data: string) {
  // base64 decoding
  const bData = Buffer.from(ciphertext, 'base64');

  // convert data to buffers
  // const salt = bData.slice(0, 64);
  // const iv = bData.slice(64, 80);
  const tag = bData.slice(80, 96);
  const text = bData.slice(96);

  // derive key using; 32 byte key length
  // const key = _crypto.pbkdf2Sync(masterkey, salt , 2145, 32, 'sha512');
  const key = V3_KEY;

  // AES 256 GCM Mode
  const decipher = _crypto.createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);
  decipher.setAAD(Buffer.from(associated_data));

  // encrypt the given text
  const decrypted = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');

  return decrypted;
}
