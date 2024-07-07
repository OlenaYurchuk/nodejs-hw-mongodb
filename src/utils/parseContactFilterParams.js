import { typeList } from "../constants/contacts.js";

const parseBoolean = value => {
    if (typeof value !== "string") return;

    if (!["true", "false"].includes(value)) return;

    return value === "true";
};

export const parseContactFilterParams = ({ type, favorite }) => {
    const parsedType = typeList.includes(type) ? type : null;
    const parsedFavorite = parseBoolean(favorite);

    return {
        type: parsedType,
        favorite: parsedFavorite,
    };
};