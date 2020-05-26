const { Router } = require('express');
const PaypalRouter = new Router();
const { pay ,success, cancel} = require('../controllers/PaypalController');


PaypalRouter.post('/pay', pay);
PaypalRouter.get('/success', success);
PaypalRouter.get('/cancel',cancel);



module.exports = PaypalRouter;
