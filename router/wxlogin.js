
module.exports = (app) => {

  // user Register
  app.post('/wxlogin/getcode', async (req, res) => {
    const appid = 'wx09fc8bca51c925c7';
    const redirect_uri = 'https%3A%2F%2yingxitech.com/login';
    const scope = 'snsapi_userinfo';
    const state = '123abc';
    // const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

    let responseObj;
    try {
      const response = await axios.get(url);
      console.log('Success:', response);
      responseObj = response.data;
    } catch (error) {
      responseObj = error;
      console.error('Error:', error);
    }

    res.send(JSON.stringify(responseObj));
  });

  app.get('/login', (req, res) => {
    console.log(req.params)
    res.send('login');
  })

}