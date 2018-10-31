var express = require('express');
var router = express.Router();
var Product = require("../models/product.js");
var Cart = require("../models/cart.js");
var Order =require("../models/order.js");
/* GET home page. */
router.get('/', function (req, res, next) {
  var successMsg = req.flash('success')[0]; // hiển thị mua hàng thành công,sau khi charge thì nó redirect về trang chủ 
  Product.find(function (err, docs) {
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('shop/index', { title: 'Express', products: productChunks,successMsg:successMsg,noMessages :!successMsg }); //res.render('shop/index', { title: 'Express',layout:'layout2.hbs' }); có thể là với đường dẫn này , nó render ra với layout là layout 2 , còn theo mặc định là mình xét nó render ra layout.hbs 
    // console.log(productChunks);
  });

});

router.get('/add-to-cart/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {}); // xem thử trong session có cart chwua nếu chưa thì cho cái cart đó là 
  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect('/');
    }
    //console.log(req.user);

    cart.add(product, productId);
    req.session.cart = cart;
    console.log(req.session.cart);
    //console.log(product);
    res.redirect('/');
  });
});

router.get('/reduce/:id',function(req,res,next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart:{});

  cart.reduceByOne(productId);

  req.session.cart = cart;
  res.redirect('/shopping-cart');
  });
  
  router.get('/remove/:id',function(req,res,next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart:{});
  
    cart.removeItem(productId);
  
    req.session.cart = cart;
    res.redirect('/shopping-cart');
    });
    

router.get('/shopping-cart', function (req, res, next) {
  var successMgs = req.flash('success')[0]; //bai 17 , khi mua thanh cong thi no tra ve trang chu kem theo flash success 
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', { products: null });
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice, successMgs: successMgs, noMessages: !successMgs });
})

router.get("/checkout",isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }

  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];//bai 16 , error này được lấy nếu post /checkout sai 
  res.render('shop/checkout', { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg });


});

router.post("/checkout", isLoggedIn,function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var stripe = require("stripe")(
    "sk_test_FpM7twaUNDOUSDayjhUk2PKt"
  );

  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "usd",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: "Test charge"
  }, function (err, charge) {
    // asynchronously called
    if (err) {
      req.flash('error', err.message);
      //console.log("cc stripe");
      return res.redirect('/checkout');
    }
    var order = new Order({
      user:req.user,
      cart:cart,
      address:req.body.address,
      name:req.body.name,
      paymentId:charge.id
    });
    order.save(function(err,result){ // sau khi lưu vào csdl thì nó thực hiện call back function 
      req.flash('success', 'Successful bought product.');
      req.session.cart = null;
      res.redirect("/");
    });

    
  });
});

module.exports = router;

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    //  console.log(req.isAuthenticated());
      return next();

  }
  req.session.oldUrl = req.url ; // tạo ra property oldUrl bên trong session 
  res.redirect('/user/signin');
}