const twilio = require('twilio');

const sendOtp = async (req, res) => {
    const { phoneNumber } = req.body;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP via SMS
    await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: 'YOUR_TWILIO_PHONE_NUMBER',
        to: phoneNumber
    });

    // Store OTP in user session or database
    req.session.otp = otp;
    req.session.phoneNumber = phoneNumber;

    res.status(200).send('OTP sent');
};



const verifyOtp = async (req, res) => {
    const { otp } = req.body;

    if (otp === req.session.otp) {
        // Authenticate the user
        // Create session or JWT
        res.status(200).send('Authenticated');
    } else {
        res.status(400).send('Invalid OTP');
    }
};
