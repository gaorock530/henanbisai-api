const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cuid = require('cuid');
const bcrypt = require('bcryptjs');
const {hex_md5} = require('../helper/md5');
const {b64_sha256} = require('../helper/sha256');
const {checkPass} = require('../helper/utils');
const _ = require('lodash');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = new mongoose.Schema({
  /*-----------------------------------------------
    Basic feilds
  -------------------------------------------------*/ 
  UID: {
    type: String,
    unique: true,
    required: true
  },
  username: { type: String, trim: true},
  nameForCheck: { type: String, uppercase: true, trim: true},
  password: {
    value: { type: String, required: true },
    secure: { type: Number, required: true} // 1,2,3
  },
  email: { type: String, defalut: '', lowercase: true, trim: true },
  phone: { type: String, defalut: '', trim: true},
  pic: {type: String, default: null},
  address: [
    {
      id: {type: String, require: true},
      recent: {type: Boolean, default: false},
      country: {type: String},
      state: {type: String},
      city: {type: String},
      area: {type: String}, //district
      detail: {type: String},
      zip: {type: String}
    }
  ],
  verification: {
    submitDate: {type: Date, defalut: null},
    verifiedAt: {type: Date, defalut: null},
    verified: {type: Number, defualt: 0}, // 0 - false, 1 - in-process, 2 - true
    by: {type: String, defalut: null},    // verified under whose authority {UID}
    idPhotoA: {type: String, defualt: ''},
    idPhotoB: {type: String, defualt: ''},
    name: {type: String, defualt: null},
    idno: {type: String, defalut: null}, // id number
    gender: {type: Boolean, default: null},
    dob: {type: Date, default: null},
    location: {type: String, defalut: null},
    phone: {type: String, defalut: null},
    expires: {type: Date, defalut: null},
  },
  
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
  
  /*-----------------------------------------------
    Optional feilds
  -------------------------------------------------*/   
  
}); 

// Pre 'save' middleware
schema.pre('save', function (next) {
  console.log('saving document');
  const user = this;
  if (user.isNew) {
    
    // user.nameForCheck = user.username;
  }
  if (user.isModified('username')) {
    // Capitalize username for checking unique
    user.nameForCheck = user.username;
  }

  // only save password when it's created or changed
  if (user.isModified('password.value')) {
    console.log('saving password...')
    // hashing password using bcrypt with 10 rounds of salting (~10 hashes / sec)
    const salt = bcrypt.genSaltSync(10);
      // actual hashing 
    const hash = bcrypt.hashSync(user.password.value, salt);
    console.log('saving password: ', hash)
    user.password.value = hash;
  }
  next();
});

const User = mongoose.model('User', schema);

module.exports = User;