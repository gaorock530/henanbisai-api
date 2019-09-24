
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sha1 = require('sha1');
const cors = require('cors');
const bodyParser = require('body-parser')

const express = require('express');
const app = express();

app.set('x-powered-by', false);
app.use(cors());
app.use(bodyParser.json())

const PORT = process.env.PORT || 5000;


app.listen(PORT, (e) => {
  console.log(e || `API Server is running on port ${PORT}.`);
});


app.post('/wxconfig', async (req, res) => {
  const token = await getAccessToken();
  const ticket = await getJsapiTicket(token);
  const timestamp = req.body.timestamp;
  const noncestr = req.body.noncestr;

  const signature = getSignature(ticket, noncestr, timestamp, req.body.url);
  res.json({
    signature, 
    timestamp,
    noncestr,
  });
})


async function getAccessToken () {
  try {
    const tokenString = fs.readFileSync(path.join(__dirname, 'accessToken.json'));
    const token = JSON.parse(tokenString);
    if (Date.now() >= token.expires_time) {
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
  token.expires_time = Date.now() + 7000000;
  const tokenJson = JSON.stringify(token);

  try {
    fs.writeFileSync(path.join(__dirname, 'accessToken.json'), tokenJson);
    return token.access_token;
  }catch(e) {
    return undefined;
  }
}

async function getJsapiTicket (token) {
  try {
    const ticketString = fs.readFileSync(path.join(__dirname, 'jsapiTicket.json'));
    const ticket = JSON.parse(ticketString);
    if (Date.now() >= ticket.expires_time) {
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
    expires: Date.now() + 7000000
  }
  const ticketJson = JSON.stringify(ticketObj);

  try {
    fs.writeFileSync(path.join(__dirname, 'jsapiTicket.json'), ticketJson);
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