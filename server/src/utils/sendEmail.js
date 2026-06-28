import nodemailer from "nodemailer";

 const sendEmail = async (to , subject , text) => {


const transporter = nodemailer.createTransport({
     host: process.env.SMTP_HOST || "smtp.gmail.com",
     port: Number(process.env.SMTP_PORT) || 587,
     secure: false,
     auth: {
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASS,
     },
});

     try{
         await transporter.sendMail({
             from: `"SmarSplit AI" <${process.env.SMTP_USER}`,
             to, 
             subject,
             text,

         });
     } catch(error){
         console.log("Email send failed: ", error.message);
         throw new Error("Failed to send email");
     }
};

export default sendEmail;
