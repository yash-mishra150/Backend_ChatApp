require('dotenv').config();
const connect = require('./DB/connect');
const user = require('./models/userScheme');

const start = async () => {
    try {
       await connect(process.env.URI);
       await user.create({name:'yash', email: 'yash@123', password:'123123'});
       console.log('sucess');
    } catch (error) {
        console.log(error)
    }
}

start();