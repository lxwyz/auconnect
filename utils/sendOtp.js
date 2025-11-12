import nodemailer from "nodemailer";
import EmailBounceParser from "email-bounce-parser";


export const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "liam75260@gmail.com",
        pass: "focbspfwjffkrwws",
      },
    });

    const mailOptions = {
      from: `"No Reply" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - AU Social",
      html: `<p>Hello,</p><p>Your OTP code is <b>${otp}</b>.</p><p>This code expires in 5 minutes.</p>`,
    };
   try {
    const result = await verifyEmailWithAPI(email);
if (!result.is_valid) {
  console.log("Invalid email, not sending");
}


    if(result.bounce){
      throw error;
    }
   } catch (error) {
    
   }
   try {
  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent:", info.messageId);
} catch (error) {
  console.error("Failed to send:", error.message);
}
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
  }
};

export default sendOtpEmail ;