const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/userScheme');
const Otp = require('../models/otpSchema');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.OTP_EMAIL,
        pass: process.env.OTP_PASS,
    },
});

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).send('User not found');
    }

    const otpRecord = await Otp.findOne({ email });
    if (otpRecord) {
        return res.status(400).send('OTP already sent for this email');
    }

    const otp = crypto.randomInt(1000, 9999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const newOtpRecord = new Otp({
        email: email,
        otp: hashedOtp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });
    await newOtpRecord.save();

    try {
        await transporter.sendMail({
            to: email,
            subject: 'Your Password Reset OTP',
            text: `Your OTP is: ${otp}`,
        });
        res.send('OTP sent');
    } catch (error) {
        console.error('Error sending OTP email:', error);
        res.status(500).send('Error sending OTP email');
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.query;
        // console.log('Verifying OTP for:', email, 'OTP:', otp);

        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord || otpRecord.expiresAt < Date.now()) {
            // console.log('Invalid or expired OTP');
            return res.status(400).send('Invalid or expired OTP');
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            console.log('Invalid OTP');
            return res.status(400).send('Invalid OTP');
        }

        console.log('OTP verified');
        await Otp.deleteOne({ email });

        res.send('OTP verified successfully');
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).send('Error verifying OTP');
    }
};

exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.query;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });

    if (!user) {
        return res.status(404).send('User not found');
    }

    res.send('Password has been reset');
};
