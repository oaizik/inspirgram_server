const mongoose = require('mongoose');
const consts = require('./consts');
const  { DB_URL } = consts;
const url = DB_URL;
const options = {
    useNewUrlParser: true, // For deprecation warnings
    useCreateIndex: true, // For deprecation warnings
    autoReconnect: true,
};
mongoose.connect(url, options)
    .then(() => console.log('connected'))
    .catch(err => console.log(`connection error: ${err}`));
