const axios = require('axios');
const fs = require('fs');
const path = require('path');
const USER = require('../models/user');
const useragent = require('useragent');

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
    if (!req.query.code) {
      res.send('发生错误，请关闭本页面，重新进入！{code}');
      return res.end();
    }


    // Step 3
    // get 'access_token' and 'refresh_token'

    let openid;
    let access_token;
    const appid = 'wx09fc8bca51c925c7';
    const appsecret = '71372b2b8883842e519485e0da99432d';
    const code = req.query.code;
    const token_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${appsecret}&code=${code}&grant_type=authorization_code`;
    try {
      const access_token_response = await axios.get(token_url); 
      if (!access_token_response.data.openid) {
        return res.send('发生错误，请关闭本页面，重新进入！{openid}');
      }
      console.log(access_token_response.data);
      openid = access_token_response.data.openid;
      access_token = access_token_response.data.access_token;
    }catch(e) {
      console.log(e);
      return res.send('发生错误，请关闭本页面，重新进入！{token}');
    }

    // Step 3.1
    // get User
    let user;
    try {
      user = await USER.findOne({openid});
      console.log(user);
    }catch(e) {
      console.log(e);
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
    const info_url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`;
    try {
      const more_response = await axios.get(more_info); 
      console.log(more_response.data);

      // User subscribed
      if (more_response.data.subscribe === 1) {
        subscribe = 1;
        openid = more_response.data.openid;
        nickname = more_response.data.nickname;
        pic = more_response.data.headimgurl;
        sex = more_response.data.sex;
        wx_province = more_response.data.province;
        wx_city = more_response.data.city;
        wx_country = more_response.data.country;
        wx_subscribe_scene = more_response.data.subscribe_scene;
      } else {
        subscribe = 0;
        const info_response = await axios.get(info_url); 
        openid = info_response.data.openid;
        nickname = info_response.data.nickname;
        pic = info_response.data.headimgurl;
        sex = info_response.data.sex;
        console.log(info_response.data);
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
        user_token = await user.generateAuthToken(ip, client, 60 * 24 *7);
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
    




    const redirect_url = `https://yingxitech.com/baoming?nickname=${nickname}&pic=${pic}&subscribe=${subscribe}&token=${user_token}`;

    res.redirect(redirect_url);
  });

}


/**
 * @getClientIP
 * @desc 获取用户 ip 地址
 * @param {Object} req - 请求
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
      req.connection.remoteAddress || // 判断 connection 的远程 IP
      req.socket.remoteAddress || // 判断后端的 socket 的 IP
      req.connection.socket.remoteAddress;
};


async function getAccessToken () {
  try {
    
    const tokenString = fs.readFileSync(path.join(__dirname, '..', 'json', 'accessToken.json'));
    console.log('log: ', 'have accessToken.json');
    const token = JSON.parse(tokenString);
    if (Date.now() >= token.expires_time) {
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
  token.expires_time = Date.now() + 7000000;
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