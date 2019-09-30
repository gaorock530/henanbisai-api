const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sha1 = require('sha1');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');



module.exports = (app) => {
  app.post('/wxconfig', async (req, res) => {
    console.log('/wxconfig')
    const token = await getAccessToken();
    console.log('token:', token);
    const ticket = await getJsapiTicket(token);
    console.log('ticket:', ticket);
    const timestamp = req.body.timestamp;
    const noncestr = req.body.noncestr;
    console.log('timestamp:', timestamp);
    console.log('noncestr:', noncestr);
    console.log(req.body);
    console.log(req.body.url)
  
    const signature = getSignature(ticket, noncestr, timestamp, req.body.url);
    console.log('signature:', signature);
    res.json({
      signature
    });
  })
}

async function getAccessToken () {
  try {
    const tokenString = fs.readFileSync(path.join(__dirname, '..', 'json', 'accessToken.json'));
    const token = JSON.parse(tokenString);
    if (ConvertUTCTimeToLocalTime(true) >= token.expires_time) {
      const tokenObj = await requireAccessToken();
      const res = updateAccessToken(tokenObj);
      if (res) return res;
    }
    return token.access_token;
  }catch(e) {
    const tokenObj = await requireAccessToken();
    const res = updateAccessToken(tokenObj);
    if (res) return res;
  } 
}

async function requireAccessToken () {
  const appid = 'wx09fc8bca51c925c7';
  const appsecret = '71372b2b8883842e519485e0da99432d';
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`;
  const res = await axios.get(url);
  return res.data;
}

function updateAccessToken (token) {
  token.expires_time = ConvertUTCTimeToLocalTime(true, false, 115);
  const tokenJson = JSON.stringify(token);

  try {
    fs.writeFileSync(path.join(__dirname, '..', 'json', 'accessToken.json'), tokenJson);
    return token.access_token;
  }catch(e) {
    return undefined;
  }
}

async function getJsapiTicket (token) {
  try {
    const ticketString = fs.readFileSync(path.join(__dirname, '..', 'json', 'jsapiTicket.json'));
    const ticket = JSON.parse(ticketString);
    if (ConvertUTCTimeToLocalTime(true)  >= ticket.expires_time) {
      const ticketString = await requireJsapiTicket(token);
      const res = updateJsapiTicket(ticketString);
      if (res) return res;
    }
    return ticket.ticket;
  }catch(e) {
    const ticketString = await requireJsapiTicket(token);
    const res = updateJsapiTicket(ticketString);
    if (res) return res;
  } 
}

async function requireJsapiTicket (token) {
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`;
  const res = await axios.get(url);
  return res.data.ticket;
}

function updateJsapiTicket (ticket) {
  const ticketObj = {
    ticket: ticket,
    expires_time: ConvertUTCTimeToLocalTime(true, false, 115)
  }
  const ticketJson = JSON.stringify(ticketObj);

  try {
    fs.writeFileSync(path.join(__dirname, '..', 'json', 'jsapiTicket.json'), ticketJson);
    return ticket;
  }catch(e) {
    return undefined;
  }
}

function getSignature(jsapi_ticket, noncestr, timestamp, url) {
  const signatureString = `jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
  const signature = sha1(signatureString);
  return signature;
}