const mongoose = require('mongoose');



const connect = () => {
    // console.log('connected to db');
    return mongoose.connect(process.env.MONGO_URI_USER, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,

    })
}

module.exports = connect;