const { Schema, model } = require('mongoose');

const paymentStructure = {
    currency: {type: String, required: true},
    total: { type: Number, required: true},
    token: {type: String, required:true ,index: true},
    createdAt: { type: Date, required: true, default: Date.now },
};


const paymentSchema = new Schema(paymentStructure);
const Payment = model('Payment', paymentSchema);

module.exports = Payment;
