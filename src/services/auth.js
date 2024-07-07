
import { UsersCollection } from "../db/models/user.js";
import { hashValue } from '../utils/hash.js';

export const findUser = filter => UsersCollection.findOne(filter);

export const registerUser = async (data) => {
    const { password } = data;
    const encryptedPassword = await hashValue(password);

    return UsersCollection.create({
        ...data,
        password: encryptedPassword,
    });
};

// export const loginUser = async (payload) => {
//     const user = await UsersCollection.findOne({
//         email: payload.email
//     });

//     if (!user) throw createHttpError(404, 'User not found');

//     const isEqual = await bcrypt.compare(payload.password, user.password);

//     if (!isEqual) {
//         throw createHttpError(401, 'Unauthorized');
//     }

//     // await SessionsCollection.deleteOne({ userId: user._id });

//     // const accessToken = randomBytes(30).toString('base64');
//     // const refreshToken = randomBytes(30).toString('base64');

//     // return await SessionsCollection.create({
//     //     userId: user._id,
//     //     accessToken,
//     //     refreshToken,
//     //     accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
//     //     refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
//     // });
// };

// export const logoutUser = async (sessionId) => {
//     await SessionsCollection.deleteOne({ _id: sessionId });
// };

// export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
//     const session = await SessionsCollection.findOne({
//         _id: sessionId,
//         refreshToken,
//     });

//     if (!session) {
//         throw createHttpError(401, 'Session not found');
//     }

//     const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);

//     if (isSessionTokenExpired) {
//         throw createHttpError(401, 'Session token expired');
//     }

//     const newSession = createSession();

//     await SessionsCollection.deleteOne({
//         _id: sessionId,
//         refreshToken,
//     });

//     return await SessionsCollection.create({
//         userId: session.userId,
//         ...newSession,
//     });
// };

