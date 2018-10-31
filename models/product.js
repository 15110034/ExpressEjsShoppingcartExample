var mongoose = require("mongoose");
var Schema = mongoose.Schema ;
var schema = new Schema({
    imagePath :{type:String ,required:true},
    title:{type:String,require:true},
    description:{type:String,require:true},
    price:{type:String,require:true}
});

module.exports =mongoose.model('product',schema);