const mongoose = require('mongoose');

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
  baoming: { type: Boolean, default: false},
  
  baoming_name: { type: String, required: true },
  baoming_sex: { type: Number, required: true }, 
  baoming_age: {type: Number, required: true },
  baoming_location: { type: Object, required: true},
  baoming_type: {type: Number, required: true },               // 0 - beijing, 1 - shanghai
  baoming_cate: {type: Number, required: true },               // 0 - 舞蹈, 1 - 声乐, 2 - 乐器, 3 - 表演, 4 - 语言, 5 - 书画
  baoming_showName: {type: String, required: true},
  baoming_phone: {type: String, required: true},
  baoming_groupType: {type: Number, required: true},
  baoming_groupName: {type: String},

  bisai_status: { type: Number, default: 0}, // 0 - idle, 1 - ready(payed), 2 - passed1, 3 - passed2, 4 - absent
  bisai_comment: { type: String, default: ''},

});




const Race = mongoose.model('Race', schema);

module.exports = Race;