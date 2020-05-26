const { Schema, model } = require('mongoose');

const sentence = {
    isActive: {type: Boolean , default: true},
    sentenceId: {type: Number ,required: true, unique: true},
    sentenceBody: { type: String, required: true },
    writerId: { type: Number, required: true },
    numOfOrders: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: {type:Date, required: true, default: Date.now },
    style: {
        textColor: { type: String, default: 'black' },
        backgroundColor: { type: String, default: 'white' },
        fontFamily: { type: String, default: '"Comic Sans MS, cursive, sans-serif' },
        fontSize: { type: String, default: "40 px"},
        fontWeight: { type:String, default: "normal"},
        fontStyle: { type:String, default: "normal"},
        textDecoration: {type:String, default: "none"},
        textAlign: { type:String , default:"center"},
        alignItems: {type: String, default:"center"},
    }
};

const sentenceSchema = new Schema(sentence);
const Sentence = model('Sentence', sentenceSchema);

module.exports = Sentence;
