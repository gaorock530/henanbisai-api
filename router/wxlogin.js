const axios = require('axios');
const fs = require('fs');
const path = require('path');
const USER = require('../models/user');
const useragent = require('useragent');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');
const getClientIP = require('../helper/ip');

const AUTH = {
  'baoming': {
    appid: 'wx09fc8bca51c925c7',
    appsecret: '71372b2b8883842e519485e0da99432d'
  },
  'webpage': {
    appid: 'wxb751a892b92c78f8',
    appsecret: 'd3ca6c8048bf345fb3c72f38608e65b1'
  }
}

module.exports = (app) => {

  app.get('/wxlogin/MP_verify_FdS96m4Og6Nb5Yrw.txt', (req, res) => {
    res.send('FdS96m4Og6Nb5Yrw');
  })


  // wxLogin Step 1
  app.get('/wxlogin', async (req, res) => {
    // encodeURIComponent('https://api.yingxitech.com/wxlogin?type=baoming');
    // https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx09fc8bca51c925c7&redirect_uri=https%3A%2F%2Fapi.yingxitech.com%2Fwxlogin%3Ftype%3Dbaoming&response_type=code&scope=snsapi_userinfo&state=baoming#wechat_redirect
    
    
    // Step 2
    // from Callback url get Code
    console.log(req.query);
    if (!req.query.code) return res.send('发生错误，请关闭本页面，重新进入！{code}');


    // Step 3
    // get 'access_token' and 'refresh_token'

    let openid;
    let unionid;
    // let access_token;
    const code = req.query.code;
    const type = req.query.type;  //baoming
    const appid = AUTH[type].appid;
    const appsecret = AUTH[type].appsecret;

    if (!appid) return res.send('发生错误，请关闭本页面，重新进入！{appid}');

    

    const token_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${appsecret}&code=${code}&grant_type=authorization_code`;
    try {
      const access_token_response = await axios.get(token_url); 
      if (!access_token_response.data.openid) {
        return res.send('发生错误，请关闭本页面，重新进入！{openid}');
      }
      console.log(access_token_response.data);
      openid = access_token_response.data.openid;
      unionid = access_token_response.data.unionid;
      access_token = access_token_response.data.access_token;
    }catch(e) {
      console.log(e);
      return res.send('发生错误，请关闭本页面，重新进入！{token}');
    }


    // Step 4
    // get User_info through openid
    let api_token;
    try {
      api_token = await getAccessToken();
      console.log(api_token);
    } catch (e) {
      console.log(e);
    }

    let subscribe, nickname, pic, sex, wx_province, wx_city, wx_country, wx_subscribe_scene;
    // subscribed User info - more
    const more_info = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${api_token}&openid=${openid}&lang=zh_CN`;
    // NOT subscribed User info - less
    // const info_url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`;
    try {
      const more_response = await axios.get(more_info); 
      console.log('more_info: ');
      console.log(more_response.data);

      // const info_response = await axios.get(info_url); 
      // console.log('info_response: ');
      // console.log(info_response.data);
      subscribe = more_response.data.subscribe;
      nickname = more_response.data.nickname;
      pic = more_response.data.headimgurl;
      sex = more_response.data.sex;
      unionid = unionid || more_response.data.unionid;

      // User subscribed
      if (more_response.data.subscribe === 1) {
        wx_province = more_response.data.province;
        wx_city = more_response.data.city;
        wx_country = more_response.data.country;
        wx_subscribe_scene = more_response.data.subscribe_scene;
      }

    }catch(e) {
      console.log(e);
      return res.send('发生错误，请关闭本页面，重新进入！{info}');
    }

    // Step 5
    // write / update Database

    const agent = useragent.parse(req.headers['user-agent']);
    const client = agent.os.toString() + '&' + agent.device.toString() + '&' + agent.toAgent();
    const ip = getClientIP(req);

    let user, user_token;
    try {
      user = await USER.findOne({unionid});
      if (!user) {
        user = new USER({
          unionid,
          openid,
          nickname,
          pic,
          sex,
          wx_province,
          wx_city,
          wx_country,
          wx_subscribe_scene,
          registerDetails: {ip, client},
          lastVisit: {ip, client},
          auth_level: 0
        });
        

        user_token = await user.generateAuthToken(ip, client, 60 * 24 *7);

      } else {
        const user_update = await user.updateOne({
          unionid,
          openid,
          nickname,
          pic,
          wx_province,
          wx_city,
          wx_country,
          wx_subscribe_scene,
          $inc: { visit_times: 1 },
          lastVisit: {ip, client, time: ConvertUTCTimeToLocalTime(true)}
        });
        console.log(user_update);
      }


      console.log(user);
    }catch(e) {
      console.log(e);
    }

    
    




    const redirect_url = `https://yingxitech.com/pay?subscribe=${subscribe}&openid=${unionid}&token=${user_token}`;
    res.redirect(redirect_url);

  });



  // login from webpage Callback API
  app.get('/authlogin/webpage', async (req, res) => {
    // Step 2
    // from Callback url get Code
    console.log(req.query);
    if (!req.query.code) return res.send('发生错误，请关闭本页面，重新进入！{code}');


    // Step 3
    // get 'access_token' and 'refresh_token'

    let openid;
    let access_token;
    const code = req.query.code;
    const appid = AUTH['webpage'].appid;
    const appsecret = AUTH['webpage'].appsecret;

    if (!appid) return res.send('发生错误，请关闭本页面，重新进入！{appid}');

    

    const token_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${appsecret}&code=${code}&grant_type=authorization_code`;
    try {
      const access_token_response = await axios.get(token_url); 
      if (!access_token_response.data.openid) {
        return res.send('发生错误，请关闭本页面，重新进入！{openid}');
      }
      console.log(access_token_response.data);
      openid = access_token_response.data.openid;
      // access_token = access_token_response.data.access_token;
    }catch(e) {
      console.log(e);
      return res.send('发生错误，请关闭本页面，重新进入！{token}');
    }

    // Step 3.1
    // get User
    // let user;
    // try {
    //   user = await USER.findOne({openid});
    //   console.log(user);
    // }catch(e) {
    //   console.log(e);
    // }



    // Step 4
    // get User_info through openid
    let api_token;
    try {
      api_token = await getAccessToken();
      console.log(api_token);
    } catch (e) {
      console.log(e);
    }

    let subscribe, nickname, pic, sex, wx_province, wx_city, wx_country, wx_subscribe_scene;
    // subscribed User info - more
    const more_info = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${api_token}&openid=${openid}&lang=zh_CN`;
    // NOT subscribed User info - less
    // const info_url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`;
    try {
      const more_response = await axios.get(more_info); 
      console.log(more_response.data);

      nickname = more_response.data.nickname;
      pic = more_response.data.headimgurl;
      sex = more_response.data.sex;
      subscribe = more_response.data.subscribe;

      // User subscribed
      if (more_response.data.subscribe === 1) {
        wx_province = more_response.data.province;
        wx_city = more_response.data.city;
        wx_country = more_response.data.country;
        wx_subscribe_scene = more_response.data.subscribe_scene;
      } 

    }catch(e) {
      console.log(e);
      return res.send('发生错误，请关闭本页面，重新进入！{info}');
    }

    // Step 5
    // write / update Database

    const agent = useragent.parse(req.headers['user-agent']);
    const client = agent.os.toString() + '&' + agent.device.toString() + '&' + agent.toAgent();
    const ip = getClientIP(req);

    let user_token;
    if (!user) {
      user = new USER({
        openid,
        nickname,
        pic,
        sex,
        wx_province,
        wx_city,
        wx_country,
        wx_subscribe_scene,
        registerDetails: {ip, client},
        lastVisit: {ip, client},
        auth_level: 0
      });
      
      try {
        user_token = await user.generateAuthToken(ip, client, 60 * 24 * 7);
        console.log(user_token);
      } catch(e) {
        console.log(e);
      }
    } else {
      const user_update = await user.updateOne({
        nickname,
        pic,
        $inc: { visit_times: 1 },
        lastVisit: {ip, client, time: ConvertUTCTimeToLocalTime(true)}
      });
      console.log(user_update);
    }
    



   
    const redirect_url = `https://yingxitech.com/bsbackend?subscribe=${subscribe}&openid=${openid}&token=${user_token}`;
    res.redirect(redirect_url);
    
  })

}





async function getAccessToken () {
  try {
    
    const tokenString = fs.readFileSync(path.join(__dirname, '..', 'json', 'accessToken.json'));
    console.log('log: ', 'have accessToken.json');
    const token = JSON.parse(tokenString);
    if (ConvertUTCTimeToLocalTime(true) >= token.expires_time) {
      const tokenObj = await requireAccessToken();
      const res = updateAccessToken(tokenObj);
      if (res) return res;
    }
    return token.access_token;
  }catch(e) {
    console.log('log: ', 'Don\'t have accessToken.json');
    const tokenObj = await requireAccessToken();
    const res = updateAccessToken(tokenObj);
    if (res) return res;
  } 
}

async function requireAccessToken () {
  console.log('log: ', 'requireAccessToken');
  const appid = 'wx09fc8bca51c925c7';
  const appsecret = '71372b2b8883842e519485e0da99432d';
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`;
  const res = await axios.get(url);
  console.log(res.data);
  return res.data;
}

function updateAccessToken (token) {
  console.log('log: ', 'updateAccessToken');
  token.expires_time = ConvertUTCTimeToLocalTime(true, false, 115);
  const tokenJson = JSON.stringify(token);

  try {
    fs.writeFileSync(path.join(__dirname, '..', 'json', 'accessToken.json'), tokenJson);
    return token.access_token;
  }catch(e) {
    console.log(e)
    return undefined;
  }
}

/**
 * { openid: 'oGCPOwwKLIZNVOa8TOqUOsdbDpLs',
  nickname: 'Punkhead',
  sex: 1,
  language: 'zh_CN',
  city: '朝阳',
  province: '北京',
  country: '中国',
  headimgurl: 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83epuEehhH7ib4EAyYIpQSc4eiaDibxw1W6icib4oce4opZsJ8IvqJXKBuDVcF1Vtu6cnuZVCOIOZCG6zovQ/132',
  privilege: [],
  unionid: 'oubKi0vS-Euz7nPp7HrRRpMtfIGA' }


  { subscribe: 1,
  openid: 'oGCPOwwKLIZNVOa8TOqUOsdbDpLs',
  nickname: 'Punkhead',
  sex: 1,
  language: 'zh_CN',
  city: '朝阳',
  province: '北京',
  country: '中国',
  headimgurl: 'http://thirdwx.qlogo.cn/mmopen/ajNVdqHZLLBBCBwkLkom5Ak5MicC1GehAcNibS2eSAyoExuw3asZeVh0FPStZ6A6iaJXT145tpg2LRbp44KDQRTVQ/132',
  subscribe_time: 1569597561,
  unionid: 'oubKi0vS-Euz7nPp7HrRRpMtfIGA',
  remark: '',
  groupid: 0,
  tagid_list: [],
  subscribe_scene: 'ADD_SCENE_PROFILE_LINK',
  qr_scene: 0,
  qr_scene_str: '' }
 */