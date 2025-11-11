import nodemailer from "nodemailer";

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
      from: "liam75260@gmail.com",
      to: "hlunhtetmin@gmail.com",
      subject: "Your OTP Code - AU Social",
      html: `<p>Hello,</p><p>Your OTP code is <b>${otp}</b>.</p><p>This code expires in 5 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
  }
};
