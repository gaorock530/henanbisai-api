import nodemailer from 'nodemailer';
import { isEmail } from 'class-validator';
import log from '@/lib/log';

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: 'hdlovers-verify@hotmail.com',
    pass: 'Highonde85211',
  },
});

export default async function sendEmail(address: string, code: string) {
  try {
    if (!isEmail(address)) throw Error('email from sendEmail');
    if (code.length !== 6) throw Error('code from sendEmail');
    const info = await transporter.sendMail({
      from: '"HDLovers" <hdlovers-verify@hotmail.com>', // sender address
      to: address, // list of receivers
      subject: '💌验证码💌', // Subject line
      // text: "Hello world?", // plain text body
      html: `<div style="padding: 1rem;background-color:#fafafa;position: relative;display: flex;align-items: center; flex-direction: column;">

      <h3 style="color: #1fadff;font-style: normal; text-decoration: none;">欢迎使用 HDlovers.com</h3>
      <div style="border: 1px solid #333; border-radius: 5px; padding: 1rem 2rem;margin: 1rem 0;">
        验证码：<b style="font-size: 1.5rem;letter-spacing: 0.2rem; font-family: 'Courier New', Courier, monospace;color: #FC1AA1;">${code}</b>
      </div>
      <div style="font-size: 0.8rem;padding: 0.2rem;">此验证码有效期为5分钟，如不是本人操作请忽略。</div>
      <div style="font-size: 0.8rem;padding: 0.2rem;">为了您的账号安全，请定期更换密码和验证方式。</div>
    </div>`, // html body
    });

    log('Message sent: %s', info.messageId);
    return info.messageId;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
