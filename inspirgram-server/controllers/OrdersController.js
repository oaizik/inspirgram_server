const Order = require('../models/Order');
const sentenceController = require('./SentencesController');
const responses = require('../config/responses').ordersResponses;
const {isset} = require('../utilities/generalHelpers');
const {products} = require('../config/types');
/**
 * get all orders function
 */
 exports.getAllOrders = (req, res) => {
     console.log('ordersController - get all orders request received ');
    Order.find({isActive: true})
        .then(docs => {
            if(!isset(docs)) {
                console.log('ordersController - get all orders request orders not found');
                return res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
            } else {
                const retData = responses.GET.SUCCESS;
                retData.json.data = docs;
                console.log('ordersController - get all orders request orders found and returned to the client');
                res.status(retData.code).json(retData.json);
            }
        })
        .catch(err =>{
            console.log(`ordersController - get all clients orders request orders db error ${err.name} message: ${err.message}`);
            return handleDbError(res, err);
        });
};


/**
 * get all client the orders function
 */
exports.getAllClientOrders = (req, res) => {
    console.log('ordersController - get all client orders request received');
    let { userId } = req.AuthUser;
    if(!isset(userId)) {
        console.log('ordersController - get all client orders request - missing parameters');
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    }

    Order.find({clientId: userId, isActive: true})
        .then(docs => {
            if(!isset(docs)  ) {
                console.log(`ordersController - get all client orders request - client id = ${userId}  orders not found`);
                return res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
            } else {
                console.log(`ordersController - get all client orders request - client id = ${userId}  orders found and returned to client`);
                const retData = responses.GET.SUCCESS;
                retData.json.data = docs;
                res.status(retData.code).json(retData.json);
                console.log(`ordersController - get all client orders request - client id = ${userId}  orders found and returned to client`);
            }
        })
        .catch(err =>{
            console.log(`ordersController - get all clients orders request orders db error ${err.name} message: ${err.message}`);
            return handleDbError(res, err);
        });
};


/**
 * add order function
 */
exports.addOrder = async (req,res) => {
    console.log('ordersController - add order request received');
    let { sentenceId, platform, style } = req.body;
    const clientId = req.AuthUser.userId;
    if(!isset(sentenceId) || !isset(clientId)) {
        console.log('ordersController - add order request missing parameters');
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    }

    if( !products.includes(platform)){
        console.log(`ordersController - platform ${platform}  is not supported`);
        return res.status(responses.WRONG_PARAMS.code).json(responses.WRONG_PARAMS.json);
    }

    const orderData = { sentenceId: sentenceId, clientId: clientId, platform: platform };

    if (typeof style == "object")
        orderData.style = style;

    orderData.orderId = await getOrderLastId()+1;
    const order = new Order(orderData);
    order.save()
        .then( result => {
            if(result) {
                // add num of orders
                console.log(`ordersController - order saved successfully`);
                sentenceController.addNumOfOrders(sentenceId);
                return res.status(responses.ADD.SAVED_SUCCESSFULLY.code).json(responses.ADD.SAVED_SUCCESSFULLY.json);
            } else {
                console.log(`ordersController - order saved successfully`);
                return res.status(responses.ADD.FAILURE.code).json(responses.ADD.FAILURE.json);
            }
        })
        .catch(
            err => {
                console.log(`ordersController - add order request db error ${err.name} message: ${err.message}`);
                return handleDbError(res, err);
            });
};

/**
 * update order function
 */ //test
exports.updateOrder = (req, res) => {
    console.log('ordersController - update order request received');
    let { platform = null, style = null, orderId = null } = req.body;
    const { userId } = req.AuthUser;
    if(orderId === null) {
        console.log(`ordersController - update order missing order id`);
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    }
    else
        orderId = parseInt(orderId);
    if(!products.includes(platform)){
        console.log(`ordersController - update order platform ${platform}  is not supported`);
        return res.status(responses.WRONG_PARAMS.code).json(responses.WRONG_PARAMS.json);
    }

    Order.findOne({orderId: orderId, isActive: true, clientId: userId})
        .then( doc => {
            if( doc === null ){
                console.log(`ordersController - update order order id: ${orderId} is not found`);
                return res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
            }
            doc.platform = platform;
            if(style !== null){
                doc.style.textColor = style.textColor !== undefined ? style.textColor : doc.style.textColor;
                doc.style.backgroundColor = style.backgroundColor !== undefined ? style.backgroundColor : doc.style.backgroundColor;
                doc.style.fontFamily = style.fontFamily !== undefined ? style.fontFamily : doc.style.fontFamily;
            }
            doc.updatedAt = Date.now();
            doc.save()
                .then(result => {
                    if(result){
                        console.log(`ordersController - update order - order saved successfully`);
                        return res.status(responses.UPDATE.SUCCESS.code).json(responses.UPDATE.SUCCESS.json);
                    }
                    else
                    {
                        console.log(`ordersController - update order - there was error to save the order`);
                        return res.status(responses.UPDATE.FAILURE.code).json(responses.UPDATE.FAILURE.json);
                    }
                })
                .catch(err => {
                    console.log(`ordersController - update order request db error ${err.name} message: ${err.message}`);
                    return handleDbError(res, err);
                })
        })
        .catch(
            err => {
                console.log(`ordersController - update order request db error ${err.name} message: ${err.message}`);
                return handleDbError(res, err);
            });

};

/**
 * delete order function
 */
exports.deleteOrder = (req, res) => {
    console.log('ordersController - delete order request received');
    let { sentenceId = null , orderId = null} = req.body;
    const {userId} = req.AuthUser;
    if(orderId === null || sentenceId === null ) {
        console.log(`ordersController - delete order missing parameters`);
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    } else {
        orderId = parseInt(orderId);
        sentenceId = parseInt(sentenceId);
    }

    Order.findOne({orderId: orderId, isActive: true, clientId:userId})
        .then(doc => {
            if( doc === null ){
                console.log(`ordersController - delete order order with order id: ${orderId} is not found`);
                return res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
            }

            doc.isActive = false;
            doc.save()
                .then(result => {
                    if(result) {
                        // --num of orders
                        sentenceController.minusNumOfOrders(sentenceId);
                        console.log(`ordersController - delete order order with order id: ${orderId} saved successfully`);
                        return res.status(responses.DELETE.SUCCESS.code).json(responses.DELETE.SUCCESS.json);
                    } else {
                        console.log(`ordersController - delete order order with order id: ${orderId} error to save`);
                        return res.status(responses.ERROR_OCCURRED.code).json(responses.ERROR_OCCURRED.json);
                    }
                })
                .catch(err => {
                    console.log(`ordersController - delete order request db error ${err.name} message: ${err.message}`);
                    return handleDbError(res, err);
                })
        })
        .catch(err =>{
            console.log(`ordersController - delete order request db error ${err.name} message: ${err.message}`);
            return handleDbError(res, err);
        });
};


handleDbError = (res, err) =>{
    const retParams = responses.DB_ERROR;
    retParams.json.message += err.name + ` message: ${err.message}` ;
    res.status(retParams.code).json(retParams.json);
};


getOrderLastId = async () => {
    const lastId = await Order.findOne({}).sort('-orderId');
    if(lastId)
        return lastId.orderId;
    else
        return 0;
};


