const USER = require('../models/user');
const CODE = require('../models/code');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');
const sendms = require('../helper/text');

module.exports = (app) => {
  app.post('/code/get', async (req, res) => {
    if (!req.body || !req.body.phone || !req.body.openid) return res.json({err: 'invalid request.', status: 2});

    const openid = req.body.openid;
    const phone = String(req.body.phone);

    try {
      // check user existence
      const user = await USER.findOne({openid});
      if (!user) return res.json({err: 'invalid id.', status: 2});
      const code = String((Math.random()*(999999-100001+1)+100001) | 0);
      // check code existence
      const savedCode = await CODE.findOne({openid});

      // no-sent before
      if (!savedCode) {
        const sendRes = await sendms(openid, phone, code);
        if (sendRes) return res.json({notice: sendRes, status: 2});
        const newCode = new CODE({
          openid,
          phone,
          code,
          expires: ConvertUTCTimeToLocalTime(true, false, 10)
        })
        await newCode.save();

        return res.json({notice: '验证码已发送, 有效期为10分钟', status: 0, expires_in: 600});

      // sent before
      } else {
        if(ConvertUTCTimeToLocalTime(true) >= savedCode.expires || phone !== savedCode.phone) {
          const sendRes = await sendms(openid, phone, code);
          if (sendRes) return res.json({notice: sendRes, status: 2});
          await savedCode.updateOne({
            phone,
            code,
            expires: ConvertUTCTimeToLocalTime(true, false, 10)
          });
          return res.json({notice: '新验证码已发送, 有效期为10分钟', status: 0, expires_in: 600});
        }

        const diff = Math.floor((savedCode.expires - ConvertUTCTimeToLocalTime(true)) / 1000);  // total sec
        const min = Math.floor(diff / 60);   // min
        const sec = diff % 60;

        return res.json({notice: `验证码已发送, 还有${min}分钟${sec}秒过期.`, expires_in: diff, status: 1});
      }
      

    }catch(e) {
      console.log(e)
      res.json({err: JSON.stringify(e), status: 2});
    }



  });

  app.post('/code/verify', async (req, res) => {
    if (!req.body || !req.body.phone || !req.body.openid || !req.body.code) return res.json({err: 'invalid request.'});
    const openid = req.body.openid;
    const phone = String(req.body.phone);
    const code = String(req.body.code);

    console.log(req.body)

    try {
      const savedCode = await CODE.findOne({openid});
      // check openid/phone
      if (!savedCode) return res.json({err: 'invalid phone/id.'});
      // check expire time
      if (ConvertUTCTimeToLocalTime(true) < savedCode.expires) {

        //check code
        if (code === savedCode.code && phone === savedCode.phone) {
          return res.json({status: 0});
        } else {
          return res.json({err: 'invalid code.'});
        }

      } else {
        return res.json({err: 'code expired.'});
      }

    } catch(e) {
      return res.json({err: e});
    }

  })
}