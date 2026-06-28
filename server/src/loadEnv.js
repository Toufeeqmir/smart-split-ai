import dotenv  from "dotenv";
dotenv.config();

console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_USER", process.env.SMTP_USER);
console.log("SMTP_PASS set:", !!process.env.SMTP_PASS);