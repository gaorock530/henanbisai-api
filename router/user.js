const USER = require('../models/user');
const useragent = require('useragent');
const getClientIP = require('../helper/ip');
const auth = require('../midware/auth');

module.exports = (app) => {

  // user Register
  app.post('/register', (req, res) => {
    res.send('register')
  });

  // user Login
  // app.post('/login', async (req, res) => {
  //   console.log('POST: /login')
  //   const agent = useragent.parse(req.headers['user-agent']);
  //   const client = agent.os.toString() + '&' + agent.device.toString() + '&' + agent.toAgent();
  //   const ip = getClientIP(req);
  //   let user, token;
  //   if (req.body.token) {
  //     // token
  //     console.log('via token')
  //     user = await USER.verifyToken(req.body.token, ip, client);
  //   } else if (req.body.openid) {
  //     // openid
  //     console.log('via openid')
  //     user = await USER.findOne({openid: req.body.openid});
  //     token = await user.generateAuthToken(ip, client, 60*24*7);
  //     user.token = token;
  //   } else {
  //     console.log('no req.body', req.body)
  //   }
  //   console.log(user);
  //   if (!user) return res.json({err: 'null'});
    
  //   res.json(user)
  // })

  // user Logout
  app.post('/logout', (req, res) => {
    res.send('logout')
  })

  // user Update
  app.put('/update/:id', auth, (req, res) => {
    res.send(`update id - ${req.params.id}`)
  })

  // Get User
  app.post('/user', async (req, res) => {
    console.log('POST: /user')
    // req.body.unionid
    if (!req.body.unionid) return res.json({user: null});
    const user = await USER.findOne({unionid: req.body.unionid});
    console.log(user)
    if (!user) return res.json({user: null});
    res.json(user)
  })


  // Get User
  app.post('/users', async (req, res) => {
    console.log('POST: /users')
    const {page, limit} = req.query;
    const num = limit? Number(limit): 100;
    const skip = page? Number(page) * 5: 0;
    try {
      const count = await USER.find().count();
      const selected = await USER.find().limit(num).select('nickname sex lastVisit pic visit_times wx_province wx_city baoming_id').skip(skip);
      res.json({count, selected})
    }catch(e) {
      console.log(e);
      res.json({err: 'internal'})
    }
    
  })
}