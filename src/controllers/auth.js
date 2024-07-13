import { registerUser, findUser } from "../services/auth.js";
import createHttpError from "http-errors";
import { compareHash } from "../utils/hash.js";
import { createSession, findSession, deleteSession } from "../services/session.js";
import { requestResetToken } from "../services/auth.js";
import { resetPassword } from "../services/auth.js";

const setupSession = (res, { refreshToken, refreshTokenValidUntil, _id }) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        expires: refreshTokenValidUntil,
    });

    res.cookie("sessionId", _id, {
        httpOnly: true,
        expires: refreshTokenValidUntil,
    });
};


export const registerUserController = async (req, res) => {
    const { email } = req.body;
    const user = await findUser({ email });

    if (user) {
        throw createHttpError(409, "Email is already in use!");
    }

    const newUser = await registerUser(req.body);

    const data = {
        name: newUser.name,
        email: newUser.email,
    };

    res.status(201).json({
        status: 201,
        message: 'Successfully registered a user!',
        data,
    });
};

export const loginUserController = async (req, res) => {
    const { email, password } = req.body;
    const user = await findUser({ email });

    if (!user) {
        throw createHttpError(404, "Email not found!");
    }

    const passwordCompare = await compareHash(password, user.password);
    if (!passwordCompare) {
        throw createHttpError(401, "Invalid password");
    }

    const session = await createSession(user._id);

    setupSession(res, session);

    res.json({
        status: 200,
        message: 'Successfully logged in an user!',
        data: {
            accessToken: session.accessToken,
        }
    });
};


export const refreshUserSessionController = async (req, res) => {
    const { refreshToken, sessionId } = req.cookies;

    const currentSession = await findSession({ _id: sessionId, refreshToken });

    if (!currentSession) {
        throw createHttpError(401, "Session not found");
    }

    const refreshTokenExpired = new Date() > new Date(currentSession.refreshTokenValidUntil);

    if (refreshTokenExpired) {
        throw createHttpError(401, "Session is expired");
    }

    const newSession = await createSession(currentSession.userId);

    setupSession(res, newSession);

    res.json({
        status: 200,
        message: "Successfully logged in an user!",
        data: {
            accessToken: newSession.accessToken,
        }
    });
};

 export const logoutUserController = async (req, res) => {
     const { sessionId } = req.cookies;
     if (!sessionId) {
         throw createHttpError(401, "Session not found");
     }

     await deleteSession({ _id: sessionId });

     res.clearCookie("sessionId");
     res.clearCookie("refreshToken");

     res.status(204).send();
 };

export const requestResetEmailController = async (req, res, next) => {
    try {
        await requestResetToken(req.body.email);
        
        res.json({
        message: 'Reset password email was successfully sent!',
        status: 200,
        data: {},
        });
    } catch (error) {
        next(createHttpError(500, 'Failed to send the email, please, try again later!'));
    }
};

export const resetPasswordController = async (req, res, next) => {
    try {
        await resetPassword(req.body);

        res.json({
            message: 'Password was successfully reset!',
            status: 200,
            data: {},
        });
    } catch (error) {
        next(createHttpError(401, 'Token is expired or invalid.'));
    }
};