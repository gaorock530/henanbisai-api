const mongoose = require('mongoose');
const cuid = require('cuid');

// (node:9106) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = new mongoose.Schema({
  /*-----------------------------------------------
    Basic feilds
  -------------------------------------------------*/ 
  refer: {
    type: String,
    unique: true,
    required: true
  },
  code: {
    type: String,
    default: cuid.slug()
  },
  location: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});



const Refer = mongoose.model('Refer', schema);

module.exports = Refer;