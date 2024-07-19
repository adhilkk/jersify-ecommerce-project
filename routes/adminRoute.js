const express = require("express");
const admin_router = express();
const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const admin_order = require('../controllers/adminOrderController')
const admin_middilware = require('../middleware/adminAuth');
const path = require("path");

const bodyParser = require("body-parser");
admin_router.use(bodyParser.json());
admin_router.use(bodyParser.urlencoded({ extended: true }));
admin_router.use(
  "/asset",
  express.static(path.join(__dirname, "../public/asset"))
);

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/productImage"));
  },

  filename: (req, file, cb) => {
    const name = Date.now() + " - " + file.originalname;
    cb(null, name);
  },
});
 
const upload = multer({
  storage: storage,

  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

admin_router.get("/",admin_middilware.isLogout, (req, res) => {
  res.render("../views/admin/adminLogin.ejs", { title: "admin" });
});

admin_router.get("/userList", adminController.loadusers);
admin_router.post("/adminLogin", adminController.handleLogin);
admin_router.post("/adminLogout", adminController.handleLogout);
admin_router.get("/dashboard", admin_middilware.isLogin, adminController.renderDashboard);



// Handle login form submission

// Dashboard route

//for blocking

admin_router.get("/admin/users", admin_middilware.isLogin, adminController.getUsers);
admin_router.get("/admin/users/:id", admin_middilware.isLogin, adminController.toggleBlockUser);

// Category routes
admin_router.get("/adminCategory", admin_middilware.isLogin, adminController.adminCategory);

admin_router.post("/addCatee", categoryController.addCategory);
admin_router.put("/CateEdit", categoryController.editCategory);
admin_router.put("/Categoryaction", categoryController.categoryAction);

//product
admin_router.get("/products", admin_middilware.isLogin, productController.loadProducts);
admin_router.get("/productsAdd", admin_middilware.isLogin, productController.loadAddproduct);
admin_router.post(
  "/productsAdd",
  upload.array("images", 3),
  productController.addProducts
);
admin_router.get("/editProduct", admin_middilware.isLogin, productController.loadeditProduct);
admin_router.put("/productStatus", productController.productStatus);
admin_router.post(
  "/productedit/:id",
  upload.fields([
    { name: "image0", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ]),
  productController.editProduct
);
admin_router.get("/products", admin_middilware.isLogin, productController.loadProducts);
admin_router.get("/products", admin_middilware.isLogin, productController.loadProducts);


//  Admin Orders List (get)
admin_router.get('/orders', admin_middilware.isLogin,admin_order.loadOrderss);

//  Admin Orders Details (post)
admin_router.get('/ordDetails', admin_order.ordersDetails);

//  Admin OrderStatus Handling (put)
admin_router.put("/orderStatusHandling", admin_order.orderProstatus);

admin_router.post("/retordmanage",admin_order.returnorderManage)


module.exports = admin_router;
