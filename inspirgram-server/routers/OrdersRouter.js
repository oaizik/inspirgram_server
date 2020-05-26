const { Router } = require('express');
const OrdersRouter = new Router();
const { getAllOrders,
    getAllClientOrders,
    addOrder,
    updateOrder,
    deleteOrder } = require('../controllers/OrdersController');

//path = /orders/all
OrdersRouter.get('/all', getAllOrders);

//path = /orders/allClient
OrdersRouter.get('/allClient', getAllClientOrders);

//path = /orders/addOrder
OrdersRouter.post('/', addOrder);

//path = /orders/
OrdersRouter.put('/', updateOrder);

//path = /orders/
OrdersRouter.delete('/', deleteOrder);

module.exports = OrdersRouter;
