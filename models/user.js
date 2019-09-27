const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cuid = require('cuid');
const bcrypt = require('bcryptjs');
const {hex_md5} = require('../helper/md5');
const {b64_sha256} = require('../helper/sha256');
const {checkPass} = require('../helper/utils');
const _ = require('lodash');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');

// (node:9106) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = new mongoose.Schema({
  /*-----------------------------------------------
    Basic feilds
  -------------------------------------------------*/ 
  openid: {
    type: String,
    unique: true,
    required: true
  },
  nickname: { type: String, trim: true},
  pic: {type: String},
  sex: { type: Number}, // 1 - male, 2 - female, 0 - unknown 
  wx_province: { type: String, default: '' },
  wx_city: { type: String, default: '' },
  wx_country: { type: String, default: '' },
  wx_subscribe_scene: { type: String, default: '' },


  baoming: { type: Boolean, default: false},
  baoming_type: { type: Number }, // 0 - indevidual, 1 - institution, 2 - school, 3 - organization
  baoming_fee: { type: Number }, // actual fees is paid
  baoming_brand: { type: String}, // name of institution/school/organization
  baoming_location_state: {type: String},
  baoming_location_city: {type: String},
  baoming_location_sub: {type: String},


  bisai_type: { type: Number }, // 0 - beijing, 1 - shanghai
  bisai_cate: { type: Number }, // 0 - 舞蹈, 1 - 声乐, 2 - 乐器, 3 - 表演, 4 - 语言, 5 - 书画
  bisai_single: { type: Boolean}, // true - single, false - group
  bisai_status: { type: Number, default: 0}, // 0 - idle, 1 - ready(payed), 2 - passed1, 3 - passed2, 4 - absent
  bisai_comment: { type: String},

 /*-----------------------------------------------
    Optional feilds
  -------------------------------------------------*/   
  name: { type: String},
  age: {type: Number},
  email: { type: String, defalut: '', lowercase: true, trim: true },
  phone: { type: String, defalut: '', trim: true},

  guardian_needed: {type: Boolean},
  guardian_name: {type: String},
  guardian_phone: {type: String},
  guardian_relation: {type: Number}, // 0 - mother, 1 - father, 2 - teacher
  
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
      loginTime: { type: Date, defalut: ConvertUTCTimeToLocalTime(true)},
      location: {type: String, defalut: ''},
      access: { type: String, required: true },
      token: { type: String, required: true },
      expires: { type: Date, required: true }
    }
  ],
  
 

}); 

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