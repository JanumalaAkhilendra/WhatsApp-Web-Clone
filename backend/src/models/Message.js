const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  msg_id: { type: String, index: true },   // id or meta_msg_id
  wa_id: { type: String, required: true }, // user id / phone number
  name: { type: String },
  number: { type: String },
  direction: { type: String, enum: ['inbound', 'outbound'], default: 'inbound' },
  text: { type: String },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent','delivered','read','unknown'], default: 'unknown' },
  raw: { type: mongoose.Schema.Types.Mixed } // raw payload
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
