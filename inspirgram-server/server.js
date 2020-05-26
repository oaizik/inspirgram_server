const express = require('express');
const app = express();
const authMiddleware = require('./middlewares/authMiddleware');
const { SentenceRouter, OrdersRouter, UsersRouter ,PaypalRouter} =require('./routers');
const { TOKEN_NAME } = require('./utilities/consts');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
app.use(express.json());

app.use(cors());
app.use(
    (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers',
            `Origin, X-Requested-With, Content-Type, ${TOKEN_NAME}, Accept`,);
        res.set('Content-Type', 'application/json');
        next();
    });

app.use(authMiddleware);

    //here all the other routers and routs

app.use('/paypal', PaypalRouter);


app.use('/sentences',SentenceRouter);
app.use('/orders', OrdersRouter);
app.use('/users', UsersRouter);

app.all('*',(req,res)=>{
    res.status(404).json({message: 'not found'})
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({message:'An error has occurred.'});
});
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
