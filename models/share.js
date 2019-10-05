const mongoose = require('mongoose');

// (node:9106) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = new mongoose.Schema({
  /*-----------------------------------------------
    Basic feilds
  -------------------------------------------------*/ 
  share_unionid: {type: String, unique: true},
  share_times: {type: Number, default: 1},
  share_opened: {type: Number, default: 0},
  share_circleAt: {type: Date}
});




const Share = mongoose.model('share', schema);

module.exports = Share;