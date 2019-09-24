import cuid from 'cuid';

const jsApiList = [
  'updateAppMessageShareData',
  'updateTimelineShareData',
  'onMenuShareTimeline',
  'onMenuShareAppMessage',
  'onMenuShareQQ',
  'onMenuShareWeibo',
  'onMenuShareQZone',
  'startRecord',
  'stopRecord',
  'onVoiceRecordEnd',
  'playVoice',
  'pauseVoice',
  'stopVoice',
  'onVoicePlayEnd',
  'uploadVoice',
  'downloadVoice',
  'chooseImage',
  'previewImage',
  'uploadImage',
  'downloadImage',
  'translateVoice',
  'getNetworkType',
  'openLocation',
  'getLocation',
  'hideOptionMenu',
  'showOptionMenu',
  'hideMenuItems',
  'showMenuItems',
  'hideAllNonBaseMenuItem',
  'showAllNonBaseMenuItem',
  'closeWindow',
  'scanQRCode',
  'chooseWXPay',
  'openProductSpecificView',
  'addCard',
  'chooseCard',
  'openCard'
]

export default async function () {
  try {
    const res = await fetch('https://www.yingxitech.com/wxconfig', {
      method: 'POST',
      body: JSON.stringify({
        timestamp: Date.now(),
        noncestr: cuid(),
        url: window.location.href
      }),
      headers:{
        'Content-Type': 'application/json'
      }
    });
    const info = await res.json();
    const config = {
      debug: true,
      appId: 'wx09fc8bca51c925c7',
      timestamp: info.timestamp,
      nonceStr: info.noncestr,
      signature: info.signature,
      jsApiList
    }
    return config;
  }catch (e) {
    console.error(e)
  }
  
}

/**
 * debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: 'wx09fc8bca51c925c7', // 必填，公众号的唯一标识
    timestamp: Date.now(), // 必填，生成签名的时间戳
    nonceStr: '123123asdqwe', // 必填，生成签名的随机串
    signature: '',// 必填，签名
    jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'] 
 */