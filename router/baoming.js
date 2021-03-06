const RACE = require('../models/race');
const USER = require('../models/user');

module.exports = (app) => {

  // new baoming
  app.post('/baoming', async (req, res) => {

    const {
      unionid,
      name,
      sex,
      age,
      area,
      type,
      cate,
      showName,
      phone,
      groupType,
      groupName
    } = req.body;
    

    const race = new RACE({
      baoming_name: name,
      baoming_sex: sex, 
      baoming_age: age,
      baoming_location: area,
      baoming_type: type,               // 0 - beijing, 1 - shanghai
      baoming_cate: cate,               // 0 - 舞蹈, 1 - 声乐, 2 - 乐器, 3 - 表演, 4 - 语言, 5 - 书画
      baoming_showName: showName,
      baoming_phone: phone,
      baoming_groupType: groupType,
      baoming_groupName: groupName,
    })

    try {
      const reacSaved = await race.save();
      await USER.findOneAndUpdate({unionid}, {
        baoming_id: reacSaved._id
      })

      console.log('race saved.');
      res.json({status: 0});
    }catch(e) {
      console.log(e);
      res.json({err: 'invaid request.'});
    }
  });

  app.post('/baoming/verify', async (req, res) => {

    const {unionid} = req.body;

    console.log(req.body)
    if (!unionid) return res.json({err: 'invaid request.'}) 

    const user = await USER.findOne({unionid});
    console.log(user);
    if (!user.baoming_id) return res.json({err: 'invaid baoming.'}) 


    console.log('/baoming/verify', user.baoming_id)
    if (!user) return res.json({err: 'invaid request.'}) 
    const race = await RACE.findById(user.baoming_id);

    if (!race) return res.json({err: 'invaid baoming_id.'}) 

    console.log('/baoming/verify', race);
    const obj = {
      ...race._doc,
      nickname: user.nickname,
      pic:user.pic,
      unionid:user.unionid
    }
    console.log(obj)

    

    res.json(obj)
  });
}