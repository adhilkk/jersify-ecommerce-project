const Address = require("../models/address");
const User = require("../models/userModel");
const Product = require("../models/product");
const Category = require("../models/categoryModel");
const Cart = require('../models/cart');
const Order = require('../models/orderModel');




const loadCheckout = async (req, res , next) => {
    
    try {

        const categoryData = await Category.find({ is_Listed: true });

        
        if (req.session.user) {
            
            const msg = req.flash('flash');
            
            const userData = await User.findById({ _id: req.session.user._id });
            
            const addresData = await Address.findOne({ userId: req.session.user._id });
            
            const cartDataa = await Cart.findOne({ userId: req.session.user._id }).populate('product.productId');

            
        
            if (cartDataa) {

               
                let newTprice = cartDataa.product.reduce((acc, val) => acc + val.price, 0);

               
                
                const cartData = await Cart.findOneAndUpdate({ userId: req.session.user._id }, { $set: { totalCartPrice: newTprice } }, { upsert: true, new: true });

                console.log(cartData,"asdfghjkl;");
                            
                res.render("users/checkout", { login: req.session.user, categoryData, addres: addresData, userData, msgg: msg ,cartData,newTprice});
                
            } else {

                res.redirect('/login')

            }

        } else {

            res.redirect('/login')


        }

    } catch (error) {

        next(error,req,res);

        
    }

};



const verifyCheckOutAddress = async (req, res , next) => {

    try {
          
        const userId = req.query.id
                  
        const exist = await Address.findOne({ userId: userId, addresss: { $elemMatch: { address: req.body.addressData.address } } });

        if (!exist) {
            
            const verifyAddress = await Address.findOneAndUpdate(
            
              { userId: req.query.id },

              {
                  $addToSet: {
                    
                  addresss: {
                        
                        name: req.body.addressData.name,
                        city: req.body.addressData.city,
                        state: req.body.addressData.state,
                        pincode: req.body.addressData.pincode,
                        phone: req.body.addressData.phone,
                        locality: req.body.addressData.locality,
                        address: req.body.addressData.address,
                        status: true,
                    
                    },
                      
                  },
                  
                },
              
                { new: true, upsert: true }
              
            );
            
            if (verifyAddress) {
                
                res.send({success : true});

            } else {

                console.log("error aneeee");

            }
            
        } else {

            res.status(400).send({ exist: true });

        }
        
    } catch (error) {

        res.status(400);
        next(error,req,res);

        
    }

};



const deleteAdd = async (req, res , next) => {
    
    try {

        const userId = req.query.id
        const addId = req.query.addId

        const deleteAdd = await Address.updateOne({ userId: userId }, { $unset: { addresss: { _id: addId } } });

        if (deleteAdd) {
            
            res.send(true);

        }
        
    } catch (error) {

        next(error, req, res);
        
    }

}



const editAddress = async (req, res , next) => {
    
    try {

        const { edit } = req.body;
        const editData = await Address.findOne({ 'addresss._id': edit }, { 'addresss.$': 1 });
        
        res.json({ editData });
        
    } catch (error) {

        next(error,req,res);

        
    }

};



const verifyEditAddress = async (req, res , next) => {
    
    try {

        const userId = req.session.user._id;

        const { name, phone, locality, pincode, address, city, state, id } = req.body;

        const editAddress = await Address.findOneAndUpdate({ userId: userId, 'addresss._id': id }, { $set: { 'addresss.$.name': name, 'addresss.$.phone': phone, 'addresss.$.locality': locality, 'addresss.$.pincode': pincode, 'addresss.$.address': address, 'addresss.$.city': city, 'addresss.$.state': state } });

        if (editAddress) {
            
            req.flash('flash', 'Address Edited');
            res.redirect('/checkout');

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};



const chooseAddress = async (req, res , next) => {
    
    try {

        const addId = req.query.id

        const userIdd = req.session.user._id;

        const update = await Address.bulkWrite([
        
            {
              
                updateOne: {
                
                    filter: { userId: userIdd, "addresss.status": true },
                    update: { $set: { "addresss.$.status": false } },
              
                },
                
            },

            {
              
                updateOne: {
                
                    filter: { userId: userIdd, "addresss._id": addId },
                    update: { $set: { "addresss.$.status": true } },
              
                },
                
            },
          
        ]);
        
    } catch (error) {

        next(error,req,res);

        
    }

};







const changeProStatus = async (req, res, next) => {
    
    try {

        const ordIdd = req.body.ordIdd

        const ord = await Order.findOne({ _id: ordIdd });

        const updation = await Order.findOneAndUpdate({ _id: ordIdd }, { $set: { 'products.$[].orderProStatus': 'pending' } });

        

        ord.products.forEach(async (e) => {
            
            let productt = await Product.findOne({ _id: e.productId });
            
            let newStock = productt.stock - e.quantity;
            
            await Product.findOneAndUpdate({ _id: e.productId }, { $set: { stock: newStock } });
            
        });

        if (updation) {
            
            res.send({ suc: true })

        }
        
    } catch (error) {

        next(error, req, res)
        
    }

};

module.exports = {

    loadCheckout,
    verifyCheckOutAddress,
    deleteAdd,
    editAddress,
    verifyEditAddress,
    chooseAddress,
    changeProStatus

}; 