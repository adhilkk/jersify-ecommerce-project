const Cart = require ('../models/cart')
const category = require ('../models/categoryModel')
const PRODUCTS = require ('../models/product')
const User = require ('../models/userModel')



const cartLoad = async ( req ,res ) => {
    
    try {
       
        const categoryData = await category.find({is_listed: true})
        const listedCategory = await category.find({is_listed:true})
        const userdata = await User.findById({_id:req.session.user._id})
        const userProduct = await Cart.findOne({userId : req.session.user._id}).populate('product.productId')
        const productQuantity = await Cart.findOne({userId : req.session.user._id}).populate('product.quantity')
        const cartData = await Cart.findOne({userId : req.session.user._id});

        

        const updateCart = userProduct.product.reduce((acc , val) => acc + val.price , 0)

        const newPrice = await Cart.findOneAndUpdate({userId : req.session.user._id} , {$set : {Total_price : updateCart}} , {new : true , upsert : true});
        
        const msg = req.flash('flash')
        
        if(req.session.user){

            

            res.render('users/cart',{login:req.session.user,listedCategory,userProduct,userdata,categoryData , newPricee : newPrice.Total_price , msgg : msg , cartData,productQuantity})

        }else{
            res.redirect('/login')
        }
        
    } catch (error) {
        
        console.log(error.message);
    }

}


const addCart = async ( req , res ) => {

    try {
        console.log(req.query.qty);

        if(req.session.user){
            const proId = req.query.id
            const userIdd = req.session.user._id
            const quantity = req.query.qty || 1

            console.log(quantity,"ASDFGHJK");

            

        const cartProduct = await PRODUCTS.findOne({_id:proId});
        console.log(cartProduct);

       

        const exist= await Cart.findOne({userId:userIdd , product: {$elemMatch: {productId: proId} } } );

        if(!exist){
            
            const total = cartProduct.discount > 0 ? cartProduct.dis_price * quantity : cartProduct.price * quantity
           

           await Cart.findOneAndUpdate({userId:userIdd},

            {$addToSet:{

                product:{productId:proId,

                price: total,quantity:quantity
            }

            }},{new:true ,upsert:true})

            res.send({success:true})

        }else{

            res.send({exist:true})
        }
        }else{
            
            res.send({failed:true})
        }
        
    } catch (error) {
        
    }

}



const cartEdit = async (req, res) => {

    try {

        const {proId , cartId,quantity} = req.body;
     
      const product = await PRODUCTS.findOne({ _id: proId });
      console.log(product,"GGGGGG");
      const newval = product.discount > 0 ? product.dis_price * quantity : product.price * quantity;
      console.log(newval,"JJJJJ");
      
      const updatedCart = await Cart.findOneAndUpdate(

        { _id: cartId, "product.productId": proId },

        {$set: { "product.$.price": newval,"product.$.quantity": req.body.quantity,},},{ new: true });

        console.log(updatedCart,"UUUUUU");
      
      const total = updatedCart.product.reduce((acc, product) => acc + product.price,0);
      console.log(total,"TTTTT");
  
       await Cart.findByIdAndUpdate(

        { _id: cartId },

        { $set: {Total_price:total}}

      );

    res.send({ success: total });

    } catch (err) {

      console.log(err.message + "   cart edit ");

    }

  };
 



const deleteCart = async(req , res)=>{

    try {

        const proId = req.query.id

        

        const deleteCartt = await Cart.findOneAndUpdate({userId : req.session.user._id} , {$pull : {product : {productId : proId}}});

        if(deleteCartt){

            res.send({succ : true})

        } else {

            res.send({fail : true});

        }
        
    } catch (error) {
        
    }

}


module.exports = {
    cartLoad,
    addCart,
    deleteCart,
    cartEdit

}