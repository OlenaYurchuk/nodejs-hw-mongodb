import createHttpError from "http-errors";
import { findSession } from "../services/session.js";
import { UsersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        next(createHttpError(401, 'Please provide Authorization header'));
        return;
    }

    const [bearer, accessToken] = authHeader.split(" ");

    if (bearer !== 'Bearer') {
        next(createHttpError(401, 'Auth header should be of type Bearer'));
        return;
    }

    if (!accessToken) {
        next(createHttpError(401, 'Token is missing'));
        return;
    }

    const session = await findSession({accessToken});

    if (!session) {
        next(createHttpError(401, 'Session not found'));
        return;
    }

    const isAccessTokenExpired = new Date() > new Date(session.accessTokenValidUntil);

    if (isAccessTokenExpired) {
        next(createHttpError(401, 'Access token expired'));
    }

    // const user = await UsersCollection.findById(session.userId);
    const user = await UsersCollection.findOne({_id: session.userId});

    if (!user) {
        next(createHttpError(401, 'User not found'));
        return;
    }

    req.user = user;

    next();
};