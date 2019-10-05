const Share = require('../models/share');
const User = require('../models/user');

const ConvertUTCTimeToLocalTime = require('../helper/timezone');

module.exports = (app) => {
  app.post('/share', async (req, res) => {
    console.log('--------------------------')
    console.log('/share');
    console.log('--------------------------')
    console.log(req.body)
    const {uri, id, type} = req.body;
    console.log(uri, id, type)
    if (!uri || !id || !type) return res.json({err: 'invalid request'});
    
    try {
      const user = await User.findOne({unionid: id});
      if (!user) return res.json({err: 'invalid id'});
      if (!user.baoming_id) return res.json({err: 'invalid bid'});

      const share = await Share.findOne({unionid: id});
      if (!share) {

        if (type === 'circle') {
          const saveRes = await new Share({
            share_unionid: id,
            share_circleAt: {type: Date}
          }).save()
        }else {
          const saveRes = await new Share({
            share_unionid: id,
          }).save()
        }

        
      } else {

        if (type === 'circle') {
          if (!share.share_circleAt) {
            await share.update({
              $inc: {share_times:1},
              share_circleAt: ConvertUTCTimeToLocalTime(true)
            })
          } else if ((ConvertUTCTimeToLocalTime(true) - share.share_circleAt) >= (24 * 60 * 60 * 1000)) {
            await share.update({
              $inc: {share_times:1},
              share_circleAt: ConvertUTCTimeToLocalTime(true)
            })
          } 
        }else {
          await share.update({
            $inc: {share_times:1}
          })
        }
      }

      /**
       *  share_unionid: {type: String, unique: true},
          share_times: {type: Number, default: 1},
          share_opened: {type: Number, default: 0}
          share_circleAt: {type: Date}
       */

    }catch(e) {
      console.log()
      return res.json({err: 'internal error'});
    }
    

    res.json(null);
  });
}