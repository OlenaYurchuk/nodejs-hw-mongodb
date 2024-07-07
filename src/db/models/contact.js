import { model, Schema } from "mongoose";
import { typeList } from "../../constants/contacts.js";
import { mongooseSaveError, setUpdateSettings } from "./hooks.js";

const contactsSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false,
        },
        isFavourite: {
            type: Boolean,
            default: false,
        },
        contactType: {
            type: String,
            enum: typeList,
            default: 'personal',
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

contactsSchema.post("save", mongooseSaveError);
contactsSchema.pre("findOneAndUpdate", setUpdateSettings);
contactsSchema.post("findOneAndUpdate", mongooseSaveError);

export const ContactsCollection = model('contacts', contactsSchema);