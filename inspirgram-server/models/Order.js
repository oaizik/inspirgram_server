const mongoose = require('mongoose');
const order = {
    orderId: { type: Number, required: true, unique: true },
    sentenceId: { type: Number, required: true },
    clientId: { type: Number, required: true },
    orderDate: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    platform: { type: String, required: true, enum: ["canvas", "photo", "t-shirt"] },
    style: {
        textColor: { type: String, default: 'black' },
        backgroundColor: { type: String, default: 'white' },
        fontFamily: { type: String, default: '"Comic Sans MS", cursive, sans-serif' },
        fontSize: { type: String, default: "40 px"},
        fontWeight: { type:String, default: "normal"},
        fontStyle: { type:String, default: "normal"},
        textDecoration: {type:String, default: "none"},
        textAlign: { type:String , default:"center"},
        alignItems: {type: String, default:"center"},
    },
    isActive: {type: Boolean , default: true},
};

const orderSchema = mongoose.Schema(order);
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
