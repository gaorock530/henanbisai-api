import { getNonce } from '@/lib/tools';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'crypto';

export default async function wepaySign(method: 'POST' | 'GET', url: string, body?: Object): Promise<string> {
  const timestamp = Date.now().toString().slice(0, -3);
  const nonce = getNonce();
  const str = `${method}\n${url}\n${timestamp}\n${nonce}\n${body ? JSON.stringify(body) : ''}\n`;

  const privateKey = await readFile(path.resolve(__dirname, '../../assets/1680223610_20240702_cert/apiclient_key.pem'), {
    encoding: 'utf-8',
  });

  // 使用商户私钥对待签名串进行SHA256 with RSA签名，并对签名结果进行Base64编码得到签名值。
  /**
   * echo -n -e \
    "GET\n/v3/certificates\n1554208460\n593BEC0C930BF1AFEB40B4A08C8FB242\n\n" \
    | openssl dgst -sha256 -sign apiclient_key.pem \
    | openssl base64 -A
    */
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(str);
  const signature = sign.sign(privateKey, 'base64');

  const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="1680223610",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="2E9114D8F600E18F55DF006C7D65BF5623342193"`;

  return Authorization;
}
