const REFER = require('../models/refer');
const auth = require('../midware/auth');

module.exports = (app) => {

  // refer Register
  app.post('/refer/register', (req, res) => {
    res.send('register')
  });

  // refer Update
  app.put('/refer/update/:id', auth, (req, res) => {
    res.send(`update id - ${req.params.id}`)
  })

  // Get Rece
  app.post('/refer', async (req, res) => {
    console.log('POST: /refer')
    // req.body.unionid
    if (!req.body.id) return res.json({refer: null});
    const refer = await REFER.findById(req.body.id);
    console.log(refer)
    if (!refer) return res.json({refer: null});
    res.json(refer)
  })


  // Get All refers
  app.post('/refers', async (req, res) => {
    console.log('POST: /refers')
    const {page, limit} = req.query;
    const num = limit? Number(limit): 100;
    const skip = page? Number(page) * 5: 0;
    try {
      const count = await REFER.find().count();
      const selected = await REFER.find().limit(num).skip(skip);
      res.json({count, selected})
    }catch(e) {
      console.log(e);
      res.json({err: 'internal'})
    }
    
  })
}