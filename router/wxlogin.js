const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
    let responseObj = {res: "/wxlogin", domin: 'api.yingxitech.com'};
    console.log(responseObj);
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

    // Step 4
    // get User_info through openid
    let api_token;
    try {
      api_token = await getAccessToken();
      console.log(api_token);
    } catch (e) {
      console.log(e);
    }
    
    const more_info = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${api_token}&openid=${openid}&lang=zh_CN`;
    const info_url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`;
    try {
      const more_response = await axios.get(more_info); 
      console.log(more_response.data);
      if (more_response.data.subscribe === 0) {
        const info_response = await axios.get(info_url); 
        console.log(info_response.data);
      }

    }catch(e) {
      console.log(e);
      return res.send('发生错误，请关闭本页面，重新进入！{info}');
    }

    res.redirect('https://yingxitech.com/baoming');
  });

  app.get('/login', (req, res) => {
    console.log(req.params)
    res.send('login');
  })

}

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

// function updateAccessToken (token) {
//   token.expires_time = Date.now() + 7000000;
//   const tokenJson = JSON.stringify(token);

//   try {
//     fs.writeFileSync(path.join(__dirname, '..', 'json', 'loginAccessToken.json'), tokenJson);
//     return token.access_token;
//   }catch(e) {
//     return undefined;
//   }
// }

// async function getAccessToken (code) {
//   try {
//     const tokenString = fs.readFileSync(path.join(__dirname, '..', 'json', 'accessToken.json'));
//     const token = JSON.parse(tokenString);
//     if (Date.now() >= token.expires_time) {
//       const tokenObj = await requireAccessToken();
//       const res = updateAccessToken(tokenObj);
//       if (res) return res;
//     }
//     return token.access_token;
//   }catch(e) {
//     const tokenObj = await requireAccessToken(code);
//     const res = updateAccessToken(tokenObj);
//     if (res) return res;
//   } 
// }

// async function requireAccessToken (code) {
//   const appid = 'wx09fc8bca51c925c7';
//   const appsecret = '71372b2b8883842e519485e0da99432d';
//   const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`;
//   const res = await axios.get(url);
//   return res.data;
// }

// async function requireThroughRefreshToken (code) {
//   const appid = 'wx09fc8bca51c925c7';
//   const appsecret = '71372b2b8883842e519485e0da99432d';
//   const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`;
//   const res = await axios.get(url);
//   return res.data;
// }