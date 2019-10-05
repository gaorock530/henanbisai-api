// const fs = require('fs');
// const path = require('path');
const axios = require('axios');
const cuid = require('cuid');
const {hex_md5} = require('../helper/md5');
const convert = require('xml-js');
const xmlparser = require('express-xml-bodyparser');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');
const RACE = require('../models/race');
const USER = require('../models/user');



module.exports = (app) => {

  app.post('/pay/request', async (req, res) => {
    const unionid = req.body.unionid;
    if (!unionid) {
      console.log('on id!')  
      return res.json({err: 'invalid request.'});
    }

    let openid;
    try {
      const user = await USER.findOne({unionid});
      if (!user) return res.json({err: 'ivalid user'});
      openid = user.openid;
    }catch(e) {
      console.log(e)
      return res.json({err: 'ivalid user'});
    }



    const json = {
      appid: 'wx09fc8bca51c925c7',
      body: '中原青少年艺术赛事网-报名费',
      limit_pay: 'no_credit',
      mch_id: '1557060081',
      nonce_str: cuid(),
      notify_url: 'https://api.yingxitech.com/pay/resultAsync',
      openid, // 'oGCPOwwKLIZNVOa8TOqUOsdbDpLs'
      out_trade_no: cuid(),
      spbill_create_ip: '42.226.30.38',
      total_fee: openid === 'oGCPOwwKLIZNVOa8TOqUOsdbDpLs'? 1:50000,
      trade_type: 'JSAPI',
    }

    const sign = getSign(json);

    json.sign = sign;

    const options = {compact: true, spaces: 4};
    const result = convert.json2xml(json, options);
    console.log(typeof result);

    const extraResult = '<xml>'+result+'</xml>';
    
    const url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

    try {
      const sendRequest = await axios.post(url, {
        headers: {'Content-Type': 'text/xml'},
        body: extraResult
      });

      var optionsJs = {ignoreComment: true, compact: true};
      const returnJson = convert.xml2js(sendRequest.data, optionsJs);

      if (returnJson.xml.return_code._cdata === 'SUCCESS') {

        console.log('prepay_id='+returnJson.xml.prepay_id._cdata);
        const payObj = {
          "appId": 'wx09fc8bca51c925c7',     //公众号名称，由商户传入     
          "nonceStr": cuid(), //随机串   
          "package": `prepay_id=${returnJson.xml.prepay_id._cdata}`,   
          "signType": "MD5",         //微信签名方式：  
          "timestamp": String(Math.floor(ConvertUTCTimeToLocalTime(true) / 1000)),         //时间戳，自1970年以来的秒数     
        }
        const paySignString = getSign(payObj);
        payObj["paySign"] = paySignString;

        res.json(payObj);
      } else {
        res.json({err: returnJson.xml.return_msg._cdata});
      }
      
    } catch(e) {
      console.log(e);
      res.json({err: JSON.stringify(e)});  
    }
  });

  // app.post('/pay/bisai_paid', (req, res) => {
    
  // })

  // app.post('pay/juesai_paid', (req, res) => {

  // })

  app.post('/pay/resultAsync', xmlparser(), async (req, res) => {
    const responseString = `<xml>
    <return_code><![CDATA[SUCCESS]]></return_code>
    <return_msg><![CDATA[OK]]></return_msg>
  </xml>`;
    console.log('----------------------------------------')
    console.log('/pay/resultAsync')
    console.log(req.body.xml)

    const {result_code ,return_code} = req.body.xml;
    if (result_code[0] === 'SUCCESS' && return_code[0] === 'SUCCESS') {
      const {appid ,mch_id, openid, total_fee, out_trade_no, transaction_id} = req.body.xml;
      const fee = String(openid[0] === 'oGCPOwwKLIZNVOa8TOqUOsdbDpLs'? 1: 50000); //50000
      console.log('fee:', fee);
      if (appid[0] === 'wx09fc8bca51c925c7' && mch_id[0] === '1557060081' && total_fee[0] === fee) {
        try {
          const user = await USER.findOne({openid: openid[0]});
          if (user) {
            const updateRace = await RACE.findByIdAndUpdate(user.baoming_id, {
              bisai_paid: true, 
              bisai_paid_amount: Number(fee),
              bisai_paid_date: ConvertUTCTimeToLocalTime(true),
              bisai_out_trade_no: out_trade_no[0], 
              bisai_transaction_id: transaction_id[0]
            });
            console.log(updateRace)
          }
        }catch(e) {
          console.log(e);
        }
      } else {
        console.log('appid[0]:', appid[0]);
        console.log('mch_id[0]:', mch_id[0]);
        console.log('total_fee[0]:', total_fee[0]);
      }
    } else {
      console.log('result_code[0]:', result_code[0])
      console.log('return_code[0]:', return_code[0])
    }

    res.set('Content-Type', 'text/xml');
    res.send(responseString)
  })

  app.post('/pay/resultApi', async (req, res) => {
    res.send('/pay/resultApi')
  });


  app.get('/pay/payscan_callback', (req, res) => {
    res.send('/pay/payscan_callback')
  })
}

/**
 * 
 * @param {{ 
  xml: 
   { appid: [ 'wx09fc8bca51c925c7' ],
     bank_type: [ 'CFT' ],
     cash_fee: [ '1' ],
     fee_type: [ 'CNY' ],
     is_subscribe: [ 'Y' ],
     mch_id: [ '1557060081' ],
     nonce_str: [ 'ck1726cvz0000t3va9z1s37ll' ],
     openid: [ 'oGCPOwwKLIZNVOa8TOqUOsdbDpLs' ],
     out_trade_no: [ 'ck1726cvz0001t3va6s7w211c' ],
     result_code: [ 'SUCCESS' ],
     return_code: [ 'SUCCESS' ],
     sign: [ 'E903FBFD3FCBDDBB9B3DC19A47B81A2D' ],
     time_end: [ '20191001074307' ],
     total_fee: [ '1' ],
     trade_type: [ 'JSAPI' ],
     transaction_id: [ '4200000400201910018651053418' ] } }} json 
 */

function getSign (json) {
  let stringArr = [];
  for(let key in json) {
    if (key === 'timestamp') {
      stringArr.push(`timeStamp=${json[key]}`)
    }else {
      stringArr.push(`${key}=${json[key]}`)
    }
    
  }
  const stringO = stringArr.join('&');
  
  const stringSignTemp = stringO+"&key=1h2g3h4j5ha8s9d897aduqokd89aiw71";
  console.log(stringSignTemp)
  const md5Sign = hex_md5(stringSignTemp).toUpperCase();

  return md5Sign;
}