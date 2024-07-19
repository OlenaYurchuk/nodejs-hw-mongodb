import { randomBytes } from "node:crypto";
import {SessionsCollection} from "../db/models/session.js";
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';

export const findSession = filter => SessionsCollection.findOne(filter);

export const createSession = async (userId) => {
    await SessionsCollection.deleteOne({ userId });

    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
    const refreshTokenValidUntil = new Date(Date.now() + ONE_DAY);

    return SessionsCollection.create({
        userId,
        accessToken,
        refreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
    });
};

export const deleteSession = filter => SessionsCollection.deleteOne(filter);