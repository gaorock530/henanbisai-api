const RACE = require('../models/race');

module.exports = (app) => {

  // new baoming
  app.post('/baoming', async (req, res) => {

    const {
      openid,
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
      openid,
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
      await race.save();
      console.log('race saved.');
      res.json({status: 0});
    }catch(e) {
      console.log(e);
      res.json({err: 'invaid request.'});
    }


    
  });

  app.post('/baoming/verify', async (req, res) => {

    const {openid} = req.body;
    if (!openid) return res.json({err: 'invaid request.'}) 

    const race = await RACE.findOne({openid});

    if (!race) res.json({err: 'invaid id.'}) 

    res.json(race)
  });

  
}