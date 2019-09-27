const axios = require('axios');

module.exports = (app) => {

  app.get('/wxlogin/MP_verify_FdS96m4Og6Nb5Yrw.txt', (req, res) => {
    res.send('FdS96m4Og6Nb5Yrw');
  })
  // wxLogin Step 1
  app.get('/wxlogin', async (req, res) => {
    // const appid = 'wx09fc8bca51c925c7';
    // const redirect_uri = encodeURIComponent('https://api.yingxitech.com/wxlogin?type=baoming');
    // const scope = 'snsapi_userinfo';
    // const state = '123abc';
    // const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
    // const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

    let responseObj = {res: "/wxlogin", domin: 'api.yingxitech.com'};
    console.log(responseObj);
    console.log(req.query);
    if (!req.query.code) {
      res.send('发生错误，请关闭本页面，重新进入！');
      return res.end();
    }

    const appid = 'wx09fc8bca51c925c7';
    const appsecret = '71372b2b8883842e519485e0da99432d';
    const code = req.query.code;
    const token_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${appsecret}&code=${code}&grant_type=authorization_code`;
    try {
      const access_token_response = await axios.get(token_url); 
      console.log(access_token_response.data);
    }catch(e) {

    }

    res.redirect('https://yingxitech.com/baoming');
  });

  app.get('/login', (req, res) => {
    console.log(req.params)
    res.send('login');
  })

}