import { createDecipheriv } from 'node:crypto';
// const { createDecipheriv } = require('node:crypto');

export default function wepayDecrypt(ciphertext: string, key: string, nonce: string, associated_data: string) {
  const encrypted = Buffer.from(ciphertext, 'base64');
  const decipher = createDecipheriv('AES-256-GCM', key, nonce);

  decipher.setAuthTag(encrypted.slice(-16));
  decipher.setAAD(Buffer.from(associated_data));

  let output = Buffer.concat([decipher.update(encrypted.slice(0, -16)), decipher.final()]);

  return output.toString();
}
