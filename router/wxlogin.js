const axios = require('axios');

module.exports = (app) => {

  app.get('/wxlogin/MP_verify_FdS96m4Og6Nb5Yrw.txt', (req, res) => {
    res.send('FdS96m4Og6Nb5Yrw');
  })
  // wxLogin Step 1
  app.get('/wxlogin', async (req, res) => {
    // const appid = 'wx09fc8bca51c925c7';
    // const redirect_uri = encodeURIComponent('https://www.yingxitech.com/login');
    // const scope = 'snsapi_userinfo';
    // const state = '123abc';
    // const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
    // const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

    let responseObj = {res: "/wxlogin", domin: 'api.yingxitech.com'};
    console.log(responseObj);
    console.log(req.query);

    res.redirect('https://yingxitech.com/baoming');
  });

  app.get('/login', (req, res) => {
    console.log(req.params)
    res.send('login');
  })

}