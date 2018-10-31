var mongoose1 = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var Schema = mongoose1.Schema;
var userSchema = new Schema({
    email:{type:String,required:true},
    password:{type:String,required:true}
});
userSchema.methods.encryptPassword  = function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(5),null); // xem cai nay 
}

userSchema.methods.validPassword  = function(password){
    return bcrypt.compareSync(password,this.password);
}
module.exports = mongoose1.model('User',userSchema);

