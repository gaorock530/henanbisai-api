const USER = require('../models/user');
const useragent = require('useragent');
const getClientIP = require('../helper/ip');

module.exports = (app) => {

  // user Register
  app.post('/register', (req, res) => {
    res.send('register')
  });

  // user Login
  app.post('/login', async (req, res) => {
    console.log('POST: /login')
    const agent = useragent.parse(req.headers['user-agent']);
    const client = agent.os.toString() + '&' + agent.device.toString() + '&' + agent.toAgent();
    const ip = getClientIP(req);
    let user;
    if (req.body.token) {
      // token
      console.log('via token')
      user = await USER.verifyToken(req.body.token, ip, client);
    } else if (req.body.openid) {
      // openid
      console.log('via openid')
      user = await USER.findOne({openid: req.body.openid});
    } else {
      console.log('no req.body', req.body)
    }
    console.log(user);
    if (!user) return res.json({user: null});
    
    res.json(user)
  })

  // user Logout
  app.post('/logout', (req, res) => {
    res.send('logout')
  })

  // user Update
  app.put('/update/:id', (req, res) => {
    res.send(`update id - ${req.params.id}`)
  })

  // Get User
  app.post('/user', async (req, res) => {
    console.log('POST: /user')
    // req.body.openid
    if (!req.body.openid) return res.json({user: null});
    const user = await USER.findOne({openid: req.body.openid});
    console.log(user)
    res.json(user)
  })
}