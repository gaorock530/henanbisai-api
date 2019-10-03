const mongoose = require('mongoose');

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
  phone: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  expires: {
    type: Date
  }
});



const Code = mongoose.model('Code', schema);

module.exports = Code;