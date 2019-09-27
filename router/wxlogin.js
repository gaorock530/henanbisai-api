
module.exports = (app) => {

  // user Register
  app.post('/wxlogin/getcode', async (req, res) => {
    const appid = 'wx09fc8bca51c925c7';
    const redirect_uri = 'https%3A%2F%2yingxitech.com/login';
    const scope = 'snsapi_userinfo';
    const state = '123abc';
    const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

    let responseObj;
    try {
      const response = await axios.post(url, {
        headers: {'Access-Control-Allow-Origin': '*'}
      });
      console.log('Success:', response);
      responseObj = response;
    } catch (error) {
      responseObj = error;
      console.error('Error:', error);
    }

    res.send(responseObj);
  });

  app.get('/login', (req, res) => {
    console.log(req.params)
    res.send('login');
  })

}