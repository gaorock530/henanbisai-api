import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@lib/HttpException';
import PayService from '@/service/pay.service';
import { generateTradeNo } from '@/lib/tools';
import log from '@/lib/log';
import { AlipaySdk } from 'alipay-sdk';
import Transaction from '@/classes/Transcation';
import { generateSign, verifySign } from '@/lib/jwt';
import { PAY_SIGN_TOKEN } from '@/config';

const alipaySdk = new AlipaySdk({
  appId: '2021004153648869',
  privateKey:
    'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmtYlcY8UbkQvs/haU6lzgGibX4p4U7bShMyFHAScJcCXwTDS/hArSiNNNxO3dOjJvFZUwIixkmQEOlqkH9cSNlQXMJX+892oqMZrR+JEQtlAnoNVcLXCgl2rT+qgpe/IyeJATaRDbW0AIBYQRZtP1R/qT2RW95Olo/sgX/oF73diOtpXx70RQXA/acdjVJufUtAl+PVfkXh8Xp2w96PGC3ooZRu1HiDv4vStKECLWkyXGzcZCxZQl3XD/B3Ep9SNwOpG30N6jq8UTh9Hc/avG8RFLvdlweUZWxSFnr8pYUViy2MMWzkXVfeuB8j9RYO1+s11ZMBc0QROk84is7ePjAgMBAAECggEAY41E2cc6jZuwY3XYRlUt4SW8zG6nuBe7JghCdwRZK2mtPjJDzZosXE0Y4fgXk2SNeYiJ7pR5rhkwaGXPytEY7vNu4toBzfZxj4DP01N8TV6RvxhsUP9RopTJVoz4ns1FdJ5Ka0zypAt50VB57WpaaL7zBBc+xIdOW0TKeImjCTQY4y7hdoyFQl37HreEYKIhg87G6CxvDm9ooc6WIs9BMyjvuo/nikaoAcS1NL73iwWyDaULU0pthj93ciGi+J+bxWNpROedneJxE8FvN/5gqobJ3QPB2x5HjZ/x327IbTPeM9WGLBikuVNUphckakDpIgfX5um7i54HTbguAR9wAQKBgQDpp9h6ohG7x611stwChshzx0R6ClkTIWfVJvyGTNSuoPHx/WexA2TlXRvx/yyGVAJcNnSKnsWdTPzGUqTztdjtQU5VVdUKPCrCNV9sA4CJK35hiQ9agDLFF/hH0bOGjKadMWezjynmctjxAc3FCDKG+6LrVm7nhZUIlj8+nYCMQQKBgQC2psOzqZKfq9OrIZo2b5vFOvYVekEOKYogzO5aNekdZfCNaR0uR5qIKXdrJ2HAcqzbBTVGk1I44jZLUSp2lWAbkRmQDpA417MmhDzkUpjQSSLNP/nb4nWVrlHFtFUsy+aGFAv/ZslP/MHGAQHe9dYmOyft1RykwzpCCDf6+wj3IwKBgQCvQNm6gb1TX13XniQvMPFBBgFymDhfhPrggbF++jm8EbPnke4ocydGciP3yzGWP4TVrXKUVqpaZdhi2LIoqgjfS9B5aTu1xZM8v9OmrKnIOPs+JRODCg0KkAQFumAxV2XRGbFymLsQwqu9eWDhnFhprmxwoA/nT+aM3kTprjExAQKBgDK9dRROATt2ImEh/pMswhsyW/Zvde8XPxYJmBVbcJ0IGqFOGBspLRayXkhYMmGh+b8GXVxzxJ2kyex2adNzf7Vow68vPIVt9oi2p6vN/kGub4qRQToCWSPxvymrBRZitnF81DBpP3eHAdWdpgVoSctpF5iMYV6sFV0Op26DmmP9AoGABkKodzMQf1U/d2aIg2MrFcpUGyL34d0aRE0gaoVpEmPZn5j4g99VKOmZ3pq5TSHvelZg3lRl1j4UNbe8mdC9TH+pS8JkFrF8phLAOxAWyviGN94lAZa6lXReJjPQRkhlz82xEla8DxbfybXxasmh6Cr1fRsNIn9WM2mca/hNi3g=',
  alipayPublicKey:
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkwuaAUS5PM6rpIMTHc00RRce/j9Wupwt4tFd8HRvKB2EGBP+uqBh+N5/lFDHRiPgzWsMQOYt6I1XChXFGUQ7AjSFgOjAQFRZ1YxfPqcTnLw4acpyiFKiXEFKBwKNoC7YAGMKGwECWBRIL4L3tUq+hTVaBHhdjb18k7dVKFkuNON9vPBCyzaJnF2Nz4Q78demy35H+46uTUz4XkmDxU7oiPxBTuOdOn+lX8wQoQBJHa1X2AnLm4cGo0LcZCc8QXrg6N7v24hL8lC2WIF4dCKzOQO9pYqRWfEx3VRlzILIy+NPiqdYUHdfrDhHzALhsuXWmbDlmL5iMD2CH3boHASBHQIDAQAB',
  gateway: 'https://openapi.alipay.com/gateway.do',
});

// function getProduct(usage: string) {
//   const title = 'HDlovers-';
//   if (usage === 'topup') return title + '充值';
//   if (usage === 'month') return title + '包月VIP';
//   if (usage === 'year') return title + '包年VIP';
//   if (usage === 'forever') return title + '永久VIP';
//   return null;
// }

class PayController {
  private payService = new PayService();

  // public alipay = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const sign = req.query['sign']?.toString();
  //     if (!sign) throw new HttpException(400, 'sign error');
  //     const newSign = await generateSign(
  //       {
  //         userId: '123123',
  //         usage: 'year',
  //         amount: '0.1',
  //       },
  //       160,
  //       PAY_SIGN_TOKEN,
  //     );
  //     if (!newSign) throw new HttpException(400, 'invalid sign');
  //     console.log({ newSign });
  //     const transactionId = generateTradeNo();

  //     const jwtDecrypted = await verifySign(sign, PAY_SIGN_TOKEN);
  //     if (!jwtDecrypted) throw new HttpException(401);
  //     const { userId, usage, amount } = jwtDecrypted.payload;
  //     if (!userId) throw new HttpException(400, 'userId error');
  //     if (!usage || (usage !== 'topup' && usage !== 'month' && usage !== 'year' && usage !== 'forever')) throw new HttpException(400, 'usage error');
  //     const checkingAmount = Number(amount);
  //     if (isNaN(checkingAmount) || checkingAmount <= 0) throw new HttpException(400, 'amount error');
  //     const subject = getProduct(usage);
  //     if (!subject) throw new HttpException(400, 'subject error');

  //     const result = alipaySdk.pageExec('alipay.trade.page.pay', 'POST', {
  //       bizContent: {
  //         out_trade_no: transactionId,
  //         total_amount: amount,
  //         subject,
  //         product_code: 'FAST_INSTANT_TRADE_PAY',
  //         qr_pay_mode: 5,
  //         qrcode_width: 200,
  //       },
  //       returnUrl: `https://api.henanbisai.com/pay/alipay_callback?userId=asd123123234123&usage=topup`,
  //     });

  //     res.send(result);
  //   } catch (error) {
  //     log({ error });
  //     next(error);
  //   }
  // };

  public alipay_callback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const OUT_TRADE_NO = req.query['out_trade_no']?.toString();
      const userId = req.query['userId']?.toString();
      const usage = req.query['usage']?.toString();
      const amount = req.query['amount']?.toString();
      const redirect_link = req.query['redirect']?.toString();

      if (!OUT_TRADE_NO || !userId || !usage || !amount || !redirect_link) throw Error('url error');

      const result = await alipaySdk.exec('alipay.trade.query', {
        bizContent: {
          out_trade_no: OUT_TRADE_NO,
          query_options: ['trade_settle_info', 'fund_bill_list'],
        },
      });

      if (result.code !== '10000' || result.msg !== 'Success') throw Error('pay error');

      // need todo
      // update user database
      const transaction = new Transaction({
        topupBy: userId,
        transactionId: result.outTradeNo,
        paymentDetail: result,
        amount: result.buyerPayAmount,
        platform: 'alipay',
        usage,
      });
      console.log(transaction);

      res.redirect(301, redirect_link);
    } catch (error) {
      log({ error });
      next(error);
    }
  };
}

export default PayController;
