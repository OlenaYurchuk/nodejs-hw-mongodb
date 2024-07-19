
import createHttpError from "http-errors";
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import { UsersCollection } from "../db/models/user.js";
import { hashValue } from '../utils/hash.js';
import { SMTP, TEMPLATES_DIR } from "../constants/index.js";
import { env } from '../utils/env.js';
import { sendEmail } from "../utils/sendMail.js";
import { getFullNameFromGoogleTokenPayload, validateCode } from "../utils/googleOAuth2.js";
import { randomBytes } from "node:crypto";
import { createSession } from "./session.js";
import { SessionsCollection } from "../db/models/session.js";

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

export const resetPassword = async (payload) => {
    let entries;

    try {
        entries = jwt.verify(payload.token, env('JWT_SECRET'));
    } catch (error) {
        if (error instanceof Error) throw createHttpError(401, error.message);
        throw error;
    }

    const user = await UsersCollection.findOne({
        email: entries.email,
        _id: entries.sub,
    });

    if (!user) {
        throw createHttpError(404, 'User not found');
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await UsersCollection.updateOne(
        { _id: user._id },
        { password: encryptedPassword },
    );
};

export const loginOrSignUpWithGoogle = async (code) => {
    const loginTicket = await validateCode(code);
    const payload = loginTicket.getPayload();
    if (!payload) throw createHttpError(401);

    let user = await UsersCollection.findOne({
        email: payload.email
    });

    if (!user) {
        const password = await bcrypt.hash(randomBytes(10), 10);
        user = await UsersCollection.create({
            email: payload.email,
            name: getFullNameFromGoogleTokenPayload(payload),
            password,
        });
    }

    const newSession = createSession();

    return await SessionsCollection.create({
        userId: user._id,
        ...newSession,
    });
};