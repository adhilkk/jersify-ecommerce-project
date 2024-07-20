const Address = require("../models/address");
const User = require("../models/userModel");
const Product = require("../models/product");
const Category = require("../models/categoryModel");
const Order = require('../models/orderModel');
const Cart = require('../models/cart');


const loadOrder = async (req, res , next) => {

    try {

        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const addressData = await Address.findOne({

                userId: req.session.user._id,

            });

            const limit = 3;
            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * limit;

            const totalOrd = await Order.countDocuments({

                userId: req.session.user._id,

            });

            const totalPages = Math.ceil(totalOrd / limit);

            const orderData = await Order.find({ userId: req.session.user._id })
                
                .populate("products.productId")
                .skip(skip)
                .limit(limit);

                console.log(orderData);

            res.render("users/orders", {

                login: req.session.user,
                categoryData,
                address: addressData,
                orderData,
                currentPage: page,
                totalPages,

            });

        } else {

            res.redirect("/login");

        }

    } catch (error) {

        next(error,req,res);


    }

};



const orderView = async (req, res , next) => {
      
    try {
        
        const categoryData = await Category.find({ is_Listed: true });

        const order = await Order.findOne({ _id: req.query.id }).populate('products.productId');

        res.render('users/orderDetails', { login: req.session.user, order, categoryData });
        
    } catch (error) {
        
        next(error, req, res);
        
    }
    
};



const orderRecieved = async (req, res , next) => {
    
    try {

        const userIdd = req.session.user._id

        if (userIdd) {

            const cartData = await Cart.findOne({ userId: userIdd });

            const addressData = await Address.findOne({ userId: userIdd });

            if (!cartData || cartData.product.length == 0) {

                req.flash('flash', 'Cart Empty');
                res.redirect("/checkout");

            } else if (!addressData || addressData.addresss.length == 0) {
                
                req.flash('flash', 'No Address');
                res.redirect("/checkout");

            } else {

                const peyMethod = req.body.peyment
        
                const cartt = await Cart.findOne({ userId: userIdd });

                // const WalletData = await Wallet.findOne({ userId: userIdd });
        
                const addresss = await Address.findOne({ userId: userIdd, 'addresss.status': true }, { 'addresss.$': 1 });
        
                const product = cartt.product;
        
                const { name, phone, address, pincode, locality, state, city } = addresss?.addresss?.[0] ?? {};
        
                const orderGot = await Order.create({
        
                    userId: userIdd,
                    products: product,
                    
                    deliveryAddress: {
                        
                        name: name,
                        phone: phone,
                        address: address,
                        locality: locality,
                        city: city,
                        state: state,
                        pincode: pincode
        
                    },
        
                    orderDate: Date.now(),
                    orderAmount: cartt.Total_price,
                    payment: peyMethod,
                    coupenDis: cartt.coupenDiscount,
                    percentage: cartt.percentage
        
                });
                
                req.session.orderGot = orderGot

                // if (req.body.peyment == 'wallet') {

                //     const balancee = WalletData.balance - cartt.Total_price

                //     const debitAmount = cartt.Total_price
                    
                //     await Wallet.findOneAndUpdate(
                    
                //         { userId: userIdd },
                      
                //         {
                          
                //             $set: { balance: balancee },
                            
                //             $push: {
                            
                //                 transaction: { amount: debitAmount, creditOrDebit: 'debit' },
                                
                //             },
                            
                //         }
                         
                //     );

                // }

                //  Quantity Managing :-
            
                if (orderGot) {
            
                    orderGot.products.forEach(async (e) => {
            
                        let productt = await Product.findOne({ _id: e.productId });
            
                        let newStock = productt.stock - e.quantity;
            
                        await Product.findOneAndUpdate({ _id: e.productId }, { $set: { stock: newStock } });
            
                    });
            
                    //  Update Cart :-
            
                    const cartRemove = await Cart.updateOne({ userId: userIdd }, { $unset: { products: 1 }, $set: {Total_price: 0, coupenDiscount: 0, percentage: 0 } });
                        
                    if (cartRemove) {
            
                        res.redirect('/thanks');
            
                    } else {
                            
                        console.log("poyi");
            
                    }
        
                }
        
            }
            
        } else {

            req.redirect("/login")

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  Load Thanks Page (Get Method) :-

const loadThanks = async (req, res , next) => {
    
    try {

        if (req.session.user && req.session.orderGot) {
            
            const categoryData = await Category.find({ is_Listed: true });
            res.render("users/thanksPage", { login: req.session.user, categoryData });

        } else {

            res.redirect('/')

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  orderCancel (Post Method) :-

const orderCancel = async (req, res , next) => {
    
    try {

        const { proId, ordId, price, reason } = req.body;
        const userIdd = req.session.user._id

        const cancelOrd = await Order.findOneAndUpdate(
        
            { _id: ordId, 'products.productId': proId },
          
            {
              
                $set: {
                
                    'products.$.orderProStatus': 'canceled',
                    'products.$.canceled': true,
                    'products.$.reason': reason,
                
                },
                
            },

            { new: true }
            
        )

        //  Adding Stock Back :-

        const orderFind = await Order.findOne({ _id: ordId, "products.productId": proId, "products.canceled": true, }, { "products.$": 1, });

        let findOrd; 
        let ordVal;  
        let moneyDecrese 

        if (orderFind) {
            
            const getQuantity = orderFind.products[0].quantity;     

            console.log(getQuantity + 'Quantity');
    
            await Product.findOneAndUpdate({ _id: proId }, { $inc: { stock: getQuantity } });

           

        }

       

    } catch (error) {

        next(error,req,res);

        
    }

};

//  ReturnOrder (Post Method) :-

const returnOrd = async (req, res , next) => {
    
    try {

        const { proId, ordId, price, reason } = req.body;
        const userIdd = req.session.user._id

        // if (req.session.user) {
            
        //     const returnOrdd = await Order.findOneAndUpdate(
            
        //         { _id: ordId, "products.productId": proId },
              
        //         {
                  
        //             $set: {
                    
        //                 "products.$.orderProStatus": "canceled",
        //                 "products.$.canceled": true,
        //                 "products.$.reason": reason,
                  
        //             },
                    
        //         },
              
        //         { new: true }
              
        //     );

        //     //  Adding Stock Back :-

        //     const findOrder = await Order.findOne({ _id: ordId, 'products.productId': proId, 'products.canceled': true }, { 'products.$': 1 });

        //     if (findOrder) {
                
        //         const findStock = findOrder.products[0].quantity;
                
        //         await Product.findOneAndUpdate({ _id: proId }, { $inc: { stock: findStock } });

        //         //  Money Managing :-
                
        //         const moneyDecreses = findOrder.products[0].price;

        //         await Order.findOneAndUpdate({ _id: ordId, 'products.productId': proId }, { $inc: { orderAmount: -moneyDecreses } });

        //     }

        //     //  CancelProduct Money Adding Wallet :-

        //     if (returnOrdd.peyment !== 'Cash on Delivery') {
                
        //         await Wallet.findOneAndUpdate({ userId: userIdd }, { $inc: { balance: price }, $push: { transaction: { amount: price, creditOrDebit: 'credit' } } }, { new: true, upsert: true });

        //         res.send({ succ: true })

        //     } else {

        //         res.send({ fail: true })

        //     }

        // }
        
        
        //  Return Product :-
        
        const returnMasg = await Order.findOneAndUpdate(
        
            { _id: ordId, "products.productId": proId },
          
            {
                $set: {
                    "products.$.retruned": true,
                    "products.$.reason": reason,
                    "products.$.forButton": true,
                },
            }
          
        );

        if (returnMasg) {
         
           
         
        } else {

            

        }

    } catch (error) {

        next(error,req,res);

        
    }

};



module.exports = {

    loadOrder,
    orderRecieved,
    loadThanks,
    orderView,
    orderCancel,
    returnOrd,
    

};