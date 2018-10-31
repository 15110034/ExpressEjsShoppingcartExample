var express = require('express');
var router = express.Router();
var csrf = require("csurf");
var passport = require("passport");
var csrfProtection = csrf();
var Order = require("../models/order.js");
var Cart = require("../models/cart.js");
router.use(csrfProtection);


router.get('/profile', isLoggedIn, function (req, res, next) { // khi chưa đăng nhập thì vào đường dẫn /user/profile sẽ thực thi hàm isLoggedIn , hàm này có nghĩa là nếu đã login vào rồi thì cho vào trang profile , còn không reaload lại trang chủ 
  //console.log(req.session.passport.user);
  Order.find({ user: req.user }, function (err, orders) {
    if (err) {
      return res.write("Error!");
    }
    var cart;
    orders.forEach(function (order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray(); // tạo một trường items mới luôn cho order 

    });
    res.render('user/profile',{orders:orders});
  });
  //res.render('user/profile', { user: req.user });  // nếu để ái router.get()... này ở dưới cái middle ware router.use... kia thì nó sẽ trả về trang chủ luôn chứ không phải về trang profile nữa 

});
/*router.get('/logout', isLoggedIn, function (req, res, next) { // chua login thi ve trang chu , login roi thi thuc thi logout
  req.logout(); // nếu để cái này ở dưới cái middle ware thì  nó sẽ redirect về trang chủ luôn chứ nó không thực hiện req.logout(); và res.redirect('/');
  res.redirect('/');
});*/
router.get('/logout', function (req, res, next) { // chua login thi ve trang chu , login roi thi thuc thi logout
  req.logout(); // nếu để cái này ở dưới cái middle ware thì  nó sẽ redirect về trang chủ luôn chứ nó không thực hiện req.logout(); và res.redirect('/');
  res.redirect('/');
}); // thấy bỏ cái isLoggedIn chỗ này đúng hơn, bởi vì khi mà nó hiện lên nut loggout thì nó đã đăng nhập rồi 
router.use('/', notLoggedIn, function (req, res, next) { // áp dụng với tất cả đường dẫn , nếu chưa login thì nó sẽ làm một cái j đó ,còn nếu login rồi thì nó về trang chủ ,nos áp dụng cho tất cả các router.get ,... các đường dẫn ở sau cái middle ware này 
  next();
});





router.get('/signup', function (req, res, next) {

  var messages = req.flash('error');
  console.log(req.flash('error'));
  res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 }); // tim hieu csrf 
});
router.post('/signup', passport.authenticate('local.signup', {
  //successRedirect:'/user/profile',   // bài 18 bỏ cái này đi 
  failureRedirect: '/user/signup',
  failureFlash: true

}), function (req, res, next) {
  if (req.session.oldUrl) {  // xử lý ngay chỗ khi đăng nhập vào rồi mà đang mua thì chuyển tới trang checkout , còn khi chưa mua đăng nhập vào nó chuyển tới trang user/profile 
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);

  }
  else {
    res.redirect('/user/profile');
  }
});


/*router.post('/user/signup',function(req,res,next){
  res.redirect('/');
})*/



router.get('/signin', function (req, res, next) {
  var messages = req.flash('error');
  res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
})
router.post('/signin', passport.authenticate('local.signin', {
  //successRedirect:'/user/profile',
  failureRedirect: '/user/signin',
  failureFlash: true
}), function (req, res, next) {
  if (req.session.oldUrl) {  // xử lý ngay chỗ khi đăng nhập vào rồi mà đang mua thì chuyển tới trang checkout , còn khi chưa mua đăng nhập vào nó chuyển tới trang user/profile 
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);

  }
  else {
    res.redirect('/user/profile');
  }
});





module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    //  console.log(req.isAuthenticated());
    return next();

  }
  res.redirect('/');
}
function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {

    return next();

  }
  res.redirect('/');
}