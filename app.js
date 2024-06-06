// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const connect = require('./DB/connect');
const PORT = process.env.PORT || 8080;
const helmet = require('helmet');
const Login_Routes = require('./routes/AuthRoute');
require('./DB/otpConnect');
const cors = require('cors');

app.get("/", (req, res) => {
    res.send("I am live from backend");
});
app.use(helmet());
app.use(express.json());
app.use('/api/auth', Login_Routes);
app.use(cors());

const start = async () => {
    try {
        await connect();
        app.listen(PORT, () => {
            console.log(`Connected to ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();
