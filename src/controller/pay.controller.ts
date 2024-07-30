import { NextFunction, Request, Response } from 'express';
import log from '@/lib/log';
import { AlipaySdk } from 'alipay-sdk';
import { Aes } from 'wechatpay-axios-plugin';
import axios from 'axios';

const alipaySdk = new AlipaySdk({
  appId: '2021004153648869',
  privateKey:
    'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmtYlcY8UbkQvs/haU6lzgGibX4p4U7bShMyFHAScJcCXwTDS/hArSiNNNxO3dOjJvFZUwIixkmQEOlqkH9cSNlQXMJX+892oqMZrR+JEQtlAnoNVcLXCgl2rT+qgpe/IyeJATaRDbW0AIBYQRZtP1R/qT2RW95Olo/sgX/oF73diOtpXx70RQXA/acdjVJufUtAl+PVfkXh8Xp2w96PGC3ooZRu1HiDv4vStKECLWkyXGzcZCxZQl3XD/B3Ep9SNwOpG30N6jq8UTh9Hc/avG8RFLvdlweUZWxSFnr8pYUViy2MMWzkXVfeuB8j9RYO1+s11ZMBc0QROk84is7ePjAgMBAAECggEAY41E2cc6jZuwY3XYRlUt4SW8zG6nuBe7JghCdwRZK2mtPjJDzZosXE0Y4fgXk2SNeYiJ7pR5rhkwaGXPytEY7vNu4toBzfZxj4DP01N8TV6RvxhsUP9RopTJVoz4ns1FdJ5Ka0zypAt50VB57WpaaL7zBBc+xIdOW0TKeImjCTQY4y7hdoyFQl37HreEYKIhg87G6CxvDm9ooc6WIs9BMyjvuo/nikaoAcS1NL73iwWyDaULU0pthj93ciGi+J+bxWNpROedneJxE8FvN/5gqobJ3QPB2x5HjZ/x327IbTPeM9WGLBikuVNUphckakDpIgfX5um7i54HTbguAR9wAQKBgQDpp9h6ohG7x611stwChshzx0R6ClkTIWfVJvyGTNSuoPHx/WexA2TlXRvx/yyGVAJcNnSKnsWdTPzGUqTztdjtQU5VVdUKPCrCNV9sA4CJK35hiQ9agDLFF/hH0bOGjKadMWezjynmctjxAc3FCDKG+6LrVm7nhZUIlj8+nYCMQQKBgQC2psOzqZKfq9OrIZo2b5vFOvYVekEOKYogzO5aNekdZfCNaR0uR5qIKXdrJ2HAcqzbBTVGk1I44jZLUSp2lWAbkRmQDpA417MmhDzkUpjQSSLNP/nb4nWVrlHFtFUsy+aGFAv/ZslP/MHGAQHe9dYmOyft1RykwzpCCDf6+wj3IwKBgQCvQNm6gb1TX13XniQvMPFBBgFymDhfhPrggbF++jm8EbPnke4ocydGciP3yzGWP4TVrXKUVqpaZdhi2LIoqgjfS9B5aTu1xZM8v9OmrKnIOPs+JRODCg0KkAQFumAxV2XRGbFymLsQwqu9eWDhnFhprmxwoA/nT+aM3kTprjExAQKBgDK9dRROATt2ImEh/pMswhsyW/Zvde8XPxYJmBVbcJ0IGqFOGBspLRayXkhYMmGh+b8GXVxzxJ2kyex2adNzf7Vow68vPIVt9oi2p6vN/kGub4qRQToCWSPxvymrBRZitnF81DBpP3eHAdWdpgVoSctpF5iMYV6sFV0Op26DmmP9AoGABkKodzMQf1U/d2aIg2MrFcpUGyL34d0aRE0gaoVpEmPZn5j4g99VKOmZ3pq5TSHvelZg3lRl1j4UNbe8mdC9TH+pS8JkFrF8phLAOxAWyviGN94lAZa6lXReJjPQRkhlz82xEla8DxbfybXxasmh6Cr1fRsNIn9WM2mca/hNi3g=',
  alipayPublicKey:
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkwuaAUS5PM6rpIMTHc00RRce/j9Wupwt4tFd8HRvKB2EGBP+uqBh+N5/lFDHRiPgzWsMQOYt6I1XChXFGUQ7AjSFgOjAQFRZ1YxfPqcTnLw4acpyiFKiXEFKBwKNoC7YAGMKGwECWBRIL4L3tUq+hTVaBHhdjb18k7dVKFkuNON9vPBCyzaJnF2Nz4Q78demy35H+46uTUz4XkmDxU7oiPxBTuOdOn+lX8wQoQBJHa1X2AnLm4cGo0LcZCc8QXrg6N7v24hL8lC2WIF4dCKzOQO9pYqRWfEx3VRlzILIy+NPiqdYUHdfrDhHzALhsuXWmbDlmL5iMD2CH3boHASBHQIDAQAB',
  gateway: 'https://openapi.alipay.com/gateway.do',
});

class PayController {
  // private payService = new PayService();

  public alipay_callback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const OUT_TRADE_NO = req.query['out_trade_no']?.toString();
      const redirect_link = req.query['redirect']?.toString();

      if (!OUT_TRADE_NO || !redirect_link) throw Error('url error');

      const result = await alipaySdk.exec('alipay.trade.query', {
        bizContent: {
          out_trade_no: OUT_TRADE_NO,
          query_options: ['trade_settle_info', 'fund_bill_list'],
        },
      });

      if (result.code !== '10000' || result.msg !== 'Success') throw Error('pay error');

      res.redirect(301, redirect_link);
    } catch (error) {
      log({ error });
      next(error);
    }
  };

  public wepay_callback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log({ wepay_callback: req.body });
      try {
        const apiv3Key = 'asdlkj123Akkj321Poaskqw1278DasFB';
        const { nonce, ciphertext, associated_data } = req.body.resource;
        const data = JSON.parse(Aes.AesGcm.decrypt(nonce, apiv3Key, ciphertext, associated_data));
        console.log({ data });
        if (!data) throw Error('decrypt error');
        const notifyServer = await axios.get(`https://api.hdlovers.com/pay/check?out_trade_no=${data.out_trade_no}&sid=henanbisai`);
        console.log({ notifyServer });
        if (notifyServer.status === 200) res.status(200).end();
        else res.status(notifyServer.status).end();
        /**
         * {
              data: {
                mchid: '1680223610',
                appid: 'wxe82604d9a68ca8cf',
                out_trade_no: '20240630722344392767975849',
                transaction_id: '4200002294202407303990247132',
                trade_type: 'NATIVE',
                trade_state: 'SUCCESS',
                trade_state_desc: '支付成功',
                bank_type: 'OTHERS',
                attach: '',
                success_time: '2024-07-30T21:00:38+08:00',
                payer: { openid: 'oBfC06tjihIkI2VXnw5y_Npjtdmo' },
                amount: {
                  total: 1,
                  payer_total: 1,
                  currency: 'CNY',
                  payer_currency: 'CNY'
                }
              }
            }
         */
      } catch (e) {
        console.log(e);
        throw e;
      }
    } catch (error) {
      log({ error });
      next(error);
    }
  };

  public alipay_notice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const display = { body, url: req.url };
      console.log(display);

      res.send(display);
    } catch (error) {
      log({ error });
      next(error);
    }
  };
}

export default PayController;
