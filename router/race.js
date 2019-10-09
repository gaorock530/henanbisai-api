const RACE = require('../models/race');
const auth = require('../midware/auth');

module.exports = (app) => {

  // race Register
  app.post('/race/register', (req, res) => {
    res.send('register')
  });

  // race Update
  app.put('/race/update/:id', auth, (req, res) => {
    res.send(`update id - ${req.params.id}`)
  })

  // Get Rece
  app.post('/race', async (req, res) => {
    console.log('POST: /race')
    // req.body.unionid
    if (!req.body.id) return res.json({race: null});
    const race = await RACE.findById(req.body.id);
    console.log(race)
    if (!race) return res.json({race: null});
    res.json(race)
  })


  // Get All races
  app.post('/races', async (req, res) => {
    console.log('POST: /races')
    const {page, limit} = req.query;
    const num = limit? Number(limit): 100;
    const skip = page? Number(page) * 5: 0;
    try {
      const count = await RACE.find().count();
      const selected = await RACE.find().limit(num).skip(skip);
      res.json({count, selected})
    }catch(e) {
      console.log(e);
      res.json({err: 'internal'})
    }
    
  })
}