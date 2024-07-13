
import createHttpError from "http-errors";
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { UsersCollection } from "../db/models/user.js";
import { hashValue } from '../utils/hash.js';
import jwt from 'jsonwebtoken';
import { SMTP, TEMPLATES_DIR } from "../constants/index.js";
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
            expiresIn: '5m',
        },
    );

    const resetPasswordTemplatePath = path.join(
        TEMPLATES_DIR,
        'reset-password-email.html',
    );

    const templateSource = (
        await fs.readFile(resetPasswordTemplatePath)
    ).toString();

    const template = handlebars.compile(templateSource);
    const html = template({
        name: user.name,
        link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
    });

    await sendEmail({
        from: env(SMTP.SMTP_FROM),
        to: email,
        subject: 'Reset your password',
        html,
    });
};