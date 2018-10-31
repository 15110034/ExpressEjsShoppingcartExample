var configValues = require("./config.json");

module.exports = {
    getDbConnectiongString: function(){
    
        return `mongodb://${configValues.username}:${configValues.password}@ds227570.mlab.com:27570/shopping`;
    }
}
