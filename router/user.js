const USER = require('../models/user');

module.exports = (app) => {

  // user Register
  app.post('/register', (req, res) => {
    res.send('register')
  });

  // user Login
  app.post('/login', (req, res) => {
    res.send('login')
  })

  // user Logout
  app.post('/logout', (req, res) => {
    res.send('logout')
  })

  // user Update
  app.put('/update/:id', (req, res) => {
    res.send(`update id - ${req.params.id}`)
  })
}