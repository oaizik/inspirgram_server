const paypal = require('paypal-rest-sdk');
const constants = require('../utilities/consts');
const { paymentResponses } = require('../config/responses')
const paypalConfigObj = constants.PAYPAL_CONFIGURE_OBJ;
const { APP_URL } = constants;
const Payment = require('../models/Payment');

paypal.configure(paypalConfigObj);




extractToken = (givenUrl) => {
    const url = new URL(givenUrl);
    return url.searchParams.get('token');
};

isItemStructValid = item =>{
    const intVal = parseFloat(item.price);
    return ( typeof intVal === "number" &&
                item.name !== undefined &&
                item.sku !== undefined &&
                item.currency !== undefined &&
                item.quantity !== undefined )

};

payPalPay = (req, res) =>{
    console.log('new paypal pay request received');
    const { items = null, currency = null } = req.body;
    if( items === null || currency === null ){
        console.log('paypal pay request - missing parameters');
        return res.status(paymentResponses.MISSING_PARAMS.code).json(paymentResponses.MISSING_PARAMS.json);
    }
    const isvalid = items.every(isItemStructValid);
    if(!isvalid){
        console.log('paypal pay request - invalid items object structure');
        return res.status(paymentResponses.MISSING_PARAMS.code).json(paymentResponses.MISSING_PARAMS.json);
    }
    let sum = 0;
    items.forEach((value) => {
        const numVal = parseFloat(value.price);
        sum += numVal*value.quantity;
    });

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": `${APP_URL}/paypal/success`,
            "cancel_url": `${APP_URL}/paypal/cancel`,
        },
        "transactions": [{
            "item_list": {
                "items": items,
            },
            "amount": {
                "currency": currency,
                "total": sum
            },
            "description": "This is the payment description."
        }]
    };
    const payDetails = {currency: currency, total: sum};
    paypal.payment.create(create_payment_json,  (error, payment) => {
        if (error) {
            console.log('paypal pay request - create payment error - error message'+error.message);
            const paymentError = paymentResponses.CREATE_PAYMENT_ERROR;
            paymentError.json.message += error.message;
            return res.status(paymentError.code).json(paymentError.json);
        }
        else {
            const approvalUrl = payment.links.find(value =>{
                return value.rel === 'approval_url';
            });
            payDetails.token = extractToken(approvalUrl.href);
            console.log(`paypal pay request - create payment - payment with token ${payDetails.token} will sent successfully to the client`);
            const pay = new Payment(payDetails)
                .save()
                    .then((p) => {
                        if(p !== null){
                            console.log(`paypal pay request - create payment - payment with token ${payDetails.token} will sent successfully to the client`);
                            return res.status(200).json({paymentLink: approvalUrl.href});
                        }
                        else {
                            return res.status(paymentResponses.SAVE_ERROR.code).json(paymentResponses.SAVE_ERROR.json);
                        }
                    })
                    .catch((err) => {
                        console.log (`paypal pay request - create payment - payment with token ${payDetails.token}${err.name} message: ${err.message}`);
                        const dbRes = paymentResponses.DB_ERROR;
                        dbRes.json.message += err.name + ` message: ${err.message}`;
                        return res.status(dbRes.code).json(dbRes.json);
                    });
        }
    });
};
exports.pay = payPalPay;

sucessPay = (req, res) =>{
    const { PayerID, paymentId, token} = req.query;
    console.log(`paypal pay success request with token ${token} received`);
    const paymentDetails = { token: token };
    Payment.findOne(paymentDetails)
        .then(doc => {
            if (doc === null)
                return res.status(404).send('not found');
            console.log(`paypal pay success request with token ${token} will execute payment`);
            const execute_payment_json = {
                "payer_id": PayerID,
                "transactions": [{
                    "amount": {
                        "currency": doc.currency,
                        "total": doc.total.toString()
                    }
                }]
            };
            paypal.payment.execute(paymentId, execute_payment_json,  (error, payment) => {
                if (error) {
                    console.log(`paypal pay success request with token ${token} there was error in payment error: ${error.message}`);
                    const paymentError = paymentResponses.EXECUTE_PAYMENT_ERROR;
                    paymentError.json.message += error.message;
                    return res.status(paymentError.code).json(paymentError.json);
                } else {
                    console.log(`paypal pay success request with token ${token} payment executed successfully`);
                    res.status(200).json(payment);
                    //todo save to db the result
                }
            });
        })
        .catch(err => {
            console.log (`paypal pay success request with token ${token} error: ${err.name} message: ${err.message}`);
            const dbRes = paymentResponses.DB_ERROR;
            dbRes.json.message += err.name + ` message: ${err.message}`;
            return res.status(dbRes.code).json(dbRes.json);
        });

};
exports.success = sucessPay;

cancelPay = (req, res) => {
    //todo save to db
    res.status(200).json({ message: 'payment canceled',})
};



exports.cancel = cancelPay;
