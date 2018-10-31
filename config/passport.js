var passport = require("passport");
var User = require("../models/user.js");
var LocalStrategy = require("passport-local").Strategy; // chọn cơ chế là strategy cho passport 

passport.serializeUser(function(user,done){  // user.id sẽ được lưu vào rong sesssion ; hàm deserializeUer sẽ lấy lại cái user đó ra  
    done(null,user.id);

});

passport.deserializeUser(function(id,done){ 
    User.findById(id,function(err,user){
        done(err,user);
    });
});

/*The user id (you provide as the second argument of the done function) is saved in the session and is later used to retrieve the whole object via the deserializeUser function.

serializeUser determines, which data of the user object should be stored in the session. The result of the serializeUser method is attached to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide the user id as the key) req.session.passport.user = {id:'xyz'} */
passport.use('local.signup',new LocalStrategy({  //tạo mới cơ chế local signup 
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true,

},function(req,email,password,done){
    req.checkBody('email','Invalid email').notEmpty().isEmail(); // kiem tra email 
    req.checkBody('password','Invalid password').notEmpty().isLength({min:4}); // kiem tra password
    var errors = req.validationErrors();
    if(errors){
        var messages =[];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null,false,req.flash('error',messages)); //đưa messages cào flash error 
    }
    //process.nextTick() sẽ làm các công việc trên theo hướng bất đồng bộ.có thể dùng 
    User.findOne({'email':email},function(err,user){
        if(err){
            return done(err);

        }
        if(user){
            return done(null,false,{message:'email is already in use. '})
        }
        var newUser =new User();
        newUser.email =email ;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err,result){
            if(err){
                return done(err);

            }
            return done(null,newUser);
        })

    });

}));


// passport sign in 
passport.use('local.signin',new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true,

},function(req,email,password,done){
    req.checkBody('email','Invalid email').notEmpty().isEmail(); // kiem tra email 
    req.checkBody('password','Invalid password').notEmpty(); // kiem tra password
    var errors = req.validationErrors();
    if(errors){
        var messages =[];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null,false,req.flash('error',messages));
    }
    User.findOne({'email':email},function(err,user){
        if(err){
            return done(err);

        }
        if(!user){
            return done(null,false,{message:'No user found. '});
        }
        if(!user.validPassword(password)){
            return done(null,false,{message:'Wrong passord. '})
        }
       return done(null,user);
    });


}));