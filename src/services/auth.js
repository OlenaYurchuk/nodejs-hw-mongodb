
import createHttpError from "http-errors";
import { UsersCollection } from "../db/models/user.js";
import { hashValue } from '../utils/hash.js';
import jwt from 'jsonwebtoken';
import { SMTP } from "../constants/index.js";
import { env } from '../utils/env.js';
import { sendEmail } from "../utils/sendMail.js";

export const findUser = filter => UsersCollection.findOne(filter);

export const registerUser = async (data) => {
    const { password } = data;
    const encryptedPassword = await hashValue(password);

    return UsersCollection.create({
        ...data,
        password: encryptedPassword,
    });
};


export const requestResetToken = async (email) => {
    const user = await UsersCollection.findOne({ email });
    if (!user) {
        throw createHttpError(404, 'User not found!');
    }

    const resetToken = jwt.sign(
        {
            sub: user._id,
            email,
        },
        env('JWT_SECRET'),
        {
            expiresIn: '15m',
        },
    );

    await sendEmail({
        from: env(SMTP.SMTP_FROM),
        to: email,
        subject: 'Reset your password',
        html: `<p>
                Click 
                    <a href="${resetToken}">here</a>
                    to reset your password!
            </p>`,
    });
};