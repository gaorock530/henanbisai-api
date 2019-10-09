const USER = require('../models/user');
const useragent = require('useragent');
// const ConvertUTCTimeToLocalTime = require('../helper/timezone');
const getClientIP = require('../helper/ip');

module.exports = async (req, res, next) => {
  const {token} = req.query;
  if (!token) return res.status(401).send({err: 'invalid token'});
  const agent = useragent.parse(req.headers['user-agent']);
  const client = agent.os.toString() + '&' + agent.device.toString() + '&' + agent.toAgent();
  const ip = getClientIP(req);

  const user = await USER.verifyToken(token, ip, client);

  if (!user) return res.status(401).send({err: 'Unauthorized'});
  req.user = user;
  next();
}