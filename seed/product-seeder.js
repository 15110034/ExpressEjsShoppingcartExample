var Product = require("../models/product.js");
var mongoose = require("mongoose");
var config = require("../config");
mongoose.connect(config.getDbConnectiongString());  
var products = [
    new Product({
        imagePath: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Game_pieces.jpg',
        title: 'game',
        description: 'awesome game',
        price: 10
    }),
    new Product({
        imagePath: 'https://upload.wikimedia.org/wikipedia/en/7/72/Warcraft_logo.png',
        title: 'game warcraf',
        description: 'awesome game haah',
        price: 12
    })
    ,
    new Product({
        imagePath: 'https://upload.wikimedia.org/wikipedia/en/6/65/Contra_cover.jpg',
        title: 'game contra1',
        description: 'awesome game1',
        price: 30
    })

];
 
var done = 0;
for(var i=0;i<products.length;i++){
    products[i].save(function(err,result){
        done++;
        if(done===products.length){
            exit();
        }

    });

}
function exit(){
    mongoose.disconnect();
}
