
// load config.json
require('./config');


const cors = require('cors');
const bodyParser = require('body-parser')
const express = require('express');
const app = express();


app.set('x-powered-by', false);
app.use(express.static('./public'));
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// set custom HTTP Headers
app.use((req, res, next) => {
  res.setHeader('Server', 'MagicBox');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

const PORT = process.env.PORT || 5000;


app.listen(PORT, (e) => {
  console.log(e || `API Server is running on port ${PORT}.`);
});


// Routes
require('./router/wxconfig')(app);
require('./router/user')(app);
require('./router/wxlogin')(app);
require('./router/code')(app);
require('./router/map')(app);

require('./router/baoming')(app);

require('./router/pay')(app);


