import nodemailer from "nodemailer";
import cron from "node-cron";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

cron.schedule('*/5 * * * *', () => {
    console.log('Email is sent every 5 minutes');

    const mailOptions = {
        from: process.env.EMAIL,
        to: "eduard.bagdagulyan2003@gmail.com",
        subject: "Test",
        text: "Hello world!"
    };

    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Email is sent!");
        }
    });
});