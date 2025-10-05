import nodemailer from "nodemailer";

export const sendRecoveryEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const url = `http://localhost:3000/reset-password?token=${token}`;

    await transporter.sendMail({
        from: "Ecommerce <no-reply@ecommerce.com>",
        to: email,
        subject: "Recuperación de contraseña",
        html: `<p>Hacé click en el enlace para restablecer tu contraseña (expira en 1 hora):</p>
               <a href="${url}">Restablecer contraseña</a>`,
    });
};
