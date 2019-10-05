const mongoose = require('mongoose');

// (node:9106) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = new mongoose.Schema({
  /*-----------------------------------------------
    Basic feilds
  -------------------------------------------------*/ 
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


  bisai_comment: { type: String, default: ''},
  
  bisai_transaction_id: {type: String},
  bisai_out_trade_no: {type: String},
  bisai_paid: {type: Boolean, default: false},
  bisai_paid_amount: {type: Number},
  bisai_paid_date: {type: Date},
  bisai_paid_status: {type: Number},

  juesai_transaction_id: {type: String},
  juesai_out_trade_no: {type: String},
  juesai_paid: {type: Boolean, default: false},
  juesai_paid_amount: {type: Number},
  juesai_paid_date: {type: Date},
  juesai_paid_status: {type: Number},

});




const Race = mongoose.model('Race', schema);

module.exports = Race;