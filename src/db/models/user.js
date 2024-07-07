import { model, Schema } from 'mongoose';
import { mongooseSaveError, setUpdateSettings } from './hooks.js';

const usersSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

usersSchema.post("save", mongooseSaveError);
usersSchema.pre("findOneAndUpdate", setUpdateSettings);
usersSchema.post("findOneAndUpdate", mongooseSaveError);

export const UsersCollection = model('users', usersSchema);