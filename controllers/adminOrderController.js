
//  Import Admin Modal :-
const Admin = require ('../models/userModel')

//  Impoert Order Modal :-
const Order = require('../models/orderModel');

const Product = require('../models/product')


//  loadOrders (Get Method) :-

const loadOrderss = async (req, res) => {
    
    try {
        
        //  Page Navigation :-

        const limit = 5;
        const page = parseInt(req.query.page) || 1
        const skip = (page - 1) * limit;

        const totaluserCount = await Order.countDocuments()
        const totalPages = Math.ceil(totaluserCount / limit);

        const orderData = await Order.find().populate('products.productId')
            
            .skip(skip)
            .limit(limit);
        
        res.render('admin/orderList', { currentPage: page, totalPages, orderData });
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  ordersDetails (Post Method) :-

const ordersDetails = async (req, res) => {
    
    try {

        const ordId = req.query.id
        console.log(ordId);

        const ordDettails = await Order.findOne({ _id: ordId }).populate('products.productId userId');
        console.log(ordDettails);

        res.render('admin/orderDetails', {ordDettails , ordId});
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  OrderDetails Handling Fub :-

const updateOrderStatus = async (orderId) => {

    try {
      
        const order = await Order.findById(orderId);
        
        const orderProStatusValues = order.products.map(
    
            (item) => item.orderProStatus
            
        );
        
        let newOrderStatus;
        
        if (orderProStatusValues.every((status) => status === "delivered")) {
        
            newOrderStatus = "delivered";
            
        } else if (orderProStatusValues.every((status) => status === "shipped")) {
            
            newOrderStatus = "shipped";
            
        } else if (orderProStatusValues.every((status) => status === "canceled")) {
            
            newOrderStatus = "canceled";
            
        } else {
            
            newOrderStatus = "pending";
            
        }

        order.orderStatus = newOrderStatus;
        
        await order.save();
        
    } catch (err) {
        
        console.log(err.message + " updateOrderStatus");
        
    }
    
};

//  orderDetails Handling (Post Method) :-

const orderProstatus = async (req, res) => {

    try {

        
        const orderId = req.body.ordId
        const productId = req.body.proId
        const bodyValue = req.body.val

        
      
        await Order.findOneAndUpdate(
    
            { _id: orderId, "products.productId": productId },

            { $set: { "products.$.orderProStatus": bodyValue } }
      
        );

      
        
        updateOrderStatus(orderId);
        
        res.json({ success: true });
        
    } catch (err) {
        
        console.log(err.message + " orderProstatus");
        res.status(500).json({ success: false, error: err.message });
        
    }
    
};

//  Return Managing Admin :-

const returnorderManage = async (req, res) => {

    try {

        const ordId = req.query.id      
        const proIdd = req.query.proId  

        console.log(ordId + "   " + proIdd);

        await Order.findOneAndUpdate(
        
            { _id: ordId, "products._id": proIdd },

            { $set: { "products.$.orderProStatus": "returned" } },

            { new: true }
        );

        //  Find Single Product And Other Things :-
        
        const orderGot = await Order.findOne(
        
            {
                _id: ordId,
                "products._id": proIdd,
                "products.retruned": true,
            },

            { "products.$": 1, userId: 1, percentage: 1, orderAmount: 1 }
          
        );

        console.log(orderGot + "ithhh");

        if (orderGot) {
            
            const ProIdd = orderGot.products[0].productId; 

            const findStock = orderGot.products[0].quantity;  

            await Product.findOneAndUpdate(
            
                        
                { _id: ProIdd },

                { $inc: { stock: findStock } },

                { new: true }

            );

            //  Money Managing :-
      
            let moneyDecreses = orderGot.products[0].price;

            console.log(moneyDecreses + "moneyyyy");
      
            //  There Is If Coupen Used Product Came (Menaging) :-
            
            if (orderGot.percentage >= 1) {

                let newVal = Math.floor((orderGot.orderAmount) - (moneyDecreses - (moneyDecreses * orderGot.percentage / 100)));
                
                await Order.findOneAndUpdate({ _id: ordId, 'products._id': proIdd }, { $set: { orderAmount: newVal } });

            } else {

                await Order.findOneAndUpdate({ _id: ordId, "products._id": proIdd }, { $inc: { orderAmount: -moneyDecreses } });
            }

            if (orderGot.products[0].retruned && ordId.peyment !== 'COD') {

                if (orderGot.percentage >= 1) {
                    
                    let newVall = Math.floor((moneyDecreses - (moneyDecreses * orderGot.percentage / 100)));

                    console.log(newVall + "offer");
                     
                    await Wallet.findOneAndUpdate({ userId: orderGot.userId }, { $inc: { balance: newVall }, $push: { transaction: { amount: newVall, creditOrDebit: 'credit' } } }, { new: true, upsert: true });

                } else {

                    await Wallet.findOneAndUpdate({ userId: orderGot.userId }, { $inc: { balance: moneyDecreses }, $push: { transaction: { amount: moneyDecreses, creditOrDebit: 'credit' } } }, { new: true, upsert: true });

                }
                
            }
                        
        };
 
    } catch (error) {

        console.log(error.message);
    }

};

module.exports = {

    loadOrderss,
    ordersDetails,
    orderProstatus,
    returnorderManage

};
