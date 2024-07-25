//  Import User Modal :-
const User = require('../models/userModel');

//  Import Product Modal :-
const Product = require('../models/product');

//  Import Category Modal :-
const Category = require('../models/categoryModel');

//  Import Wishlist Modal :-
const Wishlist = require('../models/wishlist');

//  Import Cart Modal :-
const Cart = require('../models/cart');

//  loadWishlist (Get Method) :-

const loadWishlist = async (req, res) => {
    
    try {

        console.log("1");
        const categoryData = await Category.find({ is_Listed: true });

        console.log("2");
        if (req.session.user) {
            console.log("3");

            // const wishlistData = await Wishlist.findOne({ userId: req.session.user._id }).populate('products.productId');
            const wishlistData = await Wishlist.findOne({ userId: req.session.user._id }).populate('products.productId');
         
            if (wishlistData) {
                
                const proStatus = wishlistData.products.filter(val => val.productId.status === false);

                if (proStatus.length >= 1) {
                    
                    for (const product of proStatus) {
                        
                        var newData = await Wishlist.findOneAndUpdate({ userId: req.session.user._id }, { $pull: { products: { productId: product.productId._id } } }, { new: true }).populate('products.productId');
    
                    }
                    res.render("users/wishlist", { login: req.session.user, categoryData, wishlistData: newData });
                    
                } else {
                    
                    res.render("users/wishlist", { login: req.session.user, categoryData, wishlistData });
                }
                
            }else{
                
                res.render("users/wishlist", { login: req.session.user, categoryData, wishlistData });
            }
            
        } else {

            res.redirect('/login');

        }
        
    } catch (error) {
        
        console.log(error.message);

    }

};

//   addWishlist (Post Method) :-

const addWishlist = async (req, res) => {
    
    try {
    
        const proIdd = req.query.id
        const userIdd = req.session.user._id

        const exist = await Wishlist.findOne({ userId: userIdd, products: { $elemMatch: { productId: proIdd } } }).exec();

        if (!exist) {
             
            await Wishlist.findOneAndUpdate({ userId: userIdd }, { $addToSet: { products: { productId: proIdd } } }, { upsert: true });
            
            res.send({ succ: true });
           
        } else {

            res.send({ suc: true }); 
        }

    } catch (error) {

        console.log(error.message);
        res.status(500).send({ suc: false, message: 'Internal Server Error' });
        
    }

};

//  removeWishlist (Put Method) :-

const removeWishlist = async (req, res) => {
    
    try {

        const proId = req.query.id

        const removeWishlistt = await Wishlist.findOneAndUpdate({ userId: req.session.user._id }, { $pull: { products: { productId: proId } } });

        if (removeWishlistt) {
            
            res.send({ suc: true })

        } else {

            res.send({ fail: true })

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};


module.exports = {

    loadWishlist,
    addWishlist,
    removeWishlist,

};