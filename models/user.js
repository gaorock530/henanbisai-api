const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
// const cuid = require('cuid');
// const bcrypt = require('bcryptjs');
const {hex_md5} = require('../helper/md5');
const {b64_sha256} = require('../helper/sha256');
// const {checkPass} = require('../helper/utils');
const _ = require('lodash');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');

// (node:9106) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = new mongoose.Schema({
  /*-----------------------------------------------
    Basic feilds
  -------------------------------------------------*/ 
  unionid: {
    type: String,
    unique: true,
    required: true
  },
  openid: {
    type: String,
    unique: true,
    required: true
  },
  nickname: { type: String, trim: true},
  pic: {type: String},
  sex: { type: Number}, // 1 - male, 2 - female, 0 - unknown 

  baoming_id: {type: String, unique: false},
  baoming_discount: {type: Boolean, defalut: false},

  wx_province: { type: String, default: '' },
  wx_city: { type: String, default: '' },
  wx_country: { type: String, default: '' },
  wx_subscribe_scene: { type: String, default: '' },

  visit_times: {type: Number, defalut: 0},
/*-----------------------------------------------
    Auth feilds
  -------------------------------------------------*/  
  auth_level: { type: Number, defalut: 0}, // 0 - normal, 1 - admin, 2 - owner
 /*-----------------------------------------------
    Optional feilds
  -------------------------------------------------*/   
  name: { type: String},
  age: {type: Number},
  email: { type: String, defalut: '', lowercase: true, trim: true },
  phone: { type: String, defalut: '', trim: true},
  
  /*-----------------------------------------------
    System feilds
  -------------------------------------------------*/ 
  shopping_address: {
    state: {type: String},
    city: {type: String},
    area: {type: String}, //district
    detail: {type: String},
    zip: {type: String},
    phone: {type: String},
    name: {type: String}
  },

  shopping_cart: [
    {
      item_id: {type: String},
      item_name: {type: String},
      item_quantity: {type: Number},
      item_price: {type: Number},
      item_type: {type: String}, // color/size
      item_pic: {type: String},
      item_url: {type: String},
      item_special: {type: Boolean, defalut: false} // whether on sales
    }
  ],

  shopping_list: [
    {
      item_id: {type: String},
      item_name: {type: String},
      item_quantity: {type: Number},
      item_price: {type: Number},
      item_type: {type: String}, // color/size
      item_pic: {type: String},
      item_url: {type: String},
      item_special: {type: Boolean, defalut: false}, // whether on sales
      item_status: { type: Number },  // 0 - paid, 1 - on sending, 2 - received, 3 - return, 4 - return received, 5 - other
      item_transport_type: { type: String}, // shunfeng
      item_transport_no: { type: String}, // no.12312312234234
      item_groupId: { type: String}, // asd123asd123s
    }
  ],

  /*-----------------------------------------------
    System feilds
  -------------------------------------------------*/ 
  registerDetails: { 
    ip: {type: String},
    client: {type: String},
    time: {type: Date, default: ConvertUTCTimeToLocalTime(true)}
  },
  lastVisit: {
    ip: {type: String},
    client: {type: String},
    time: {type: Date, default: ConvertUTCTimeToLocalTime(true)}
  },
  
  /*-----------------------------------------------
    login tokens
  -------------------------------------------------*/   
  tokens: [
    {
      access: { type: String, required: true },
      token: { type: String, required: true },
      expires: { type: Date, required: true }
    }
  ],
  
 

}); 

/**
 * @description Class methods on USER
 */

// Class method for generate Token
schema.methods.generateAuthToken = function (ip, client, expires) {
  const user = this;
  // user access level - {USER, ADMIN(trade, topics), SUPER, OWNER}
  const access = user.auth_level;
  expires = expires?ConvertUTCTimeToLocalTime(true, false, expires):ConvertUTCTimeToLocalTime(true, false);
  if (!ip || !client) throw 'Missing....{ip, client}';
  // make hash value of IP + Client
  const hash = b64_sha256(hex_md5(ip + client));
  let token = jwt.sign({
    openid: user.openid,          // user_id: 5ad63292c1bedd0c9378af0a
    access,                       // access level: 2
    hash,                         // hash contains IP + Client: pKDcCf+HJX+vJLStdNPPgJp1RtVSiDLN3JM0KL7hSKQ
    expires                       // token expires timestamp: 1524618158943
  }, process.env.JWT_SECRET);

  // push Token with something into user Tokens Array
  user.tokens.push({
    access, 
    token, 
    expires
  });
  // save user
  return user.save().then(() => {
    return token
  }).catch((e)=>{
    throw e
  });
}

schema.methods.removeToken = function (token) {
  const user = this;
  return user.update({
    $pull: {
      tokens: {token}
    }
  });
}

schema.methods.refreshToken = function () {
  const user = this;
  return user.update(
    { $pull: {tokens: { expires: { $lte: ConvertUTCTimeToLocalTime(true) } } } },
    { multi: true }
  )
}

/**
 * @description Static methods on USER
 */

schema.statics.verifyToken = async function (token = '', ip, client) {
  const users = this;
  try {
    // decode token into payload
    const payload = await jwt.verify(token, process.env.JWT_SECRET);
    // use payload info find user
    const user = await users.findOne({
      'openid': payload.openid,
      'tokens.token': token,
      'tokens.access': payload.access 
    });
    // check if user exists
    if (!user) {
      console.log('user not found || token removed');
      return false;
    }
    // check if token expires
    if (payload.expires < ConvertUTCTimeToLocalTime(true)) {
      //remove expired token
      const cb = await user.updateOne({ $pull: { tokens: {token} } });
      console.log({cb ,msg: 'token expired and will be removed'})
      return false; 
    }
    // check if this token is generated by the same client (IP + Client)
    const hash = b64_sha256(hex_md5(ip + client));
    if (hash !== payload.hash) {
      console.log('not same client');
      return false;
    }
    return user;
  }catch(e) {
    console.warn('error from user.js Catch(e)', e);
    return false;
  }
}

// Pre 'save' middleware
schema.pre('save', function (next) {
  console.log('saving document');
  const user = this;
  if (user.isNew) {
    // new user

  }
  if (user.isModified('nickname')) {
    // Capitalize username for checking unique

  }

  // only save password when it's created or changed
  // if (user.isModified('password.value')) {
  //   console.log('saving password...')
  //   // hashing password using bcrypt with 10 rounds of salting (~10 hashes / sec)
  //   const salt = bcrypt.genSaltSync(10);
  //     // actual hashing 
  //   const hash = bcrypt.hashSync(user.password.value, salt);
  //   console.log('saving password: ', hash)
  //   user.password.value = hash;
  // }
  next();
});

const User = mongoose.model('User', schema);

module.exports = User;
