const mongoose = require('mongoose');

const otpDbConnection = mongoose.createConnection(process.env.MONGO_URI_OTP, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useCreateIndex: true,
});

otpDbConnection.on('connected', () => {
    console.log('Connected to OTP database');
});

otpDbConnection.on('error', (error) => {
    console.error('Error connecting to OTP database:', error);
});

module.exports = otpDbConnection;
