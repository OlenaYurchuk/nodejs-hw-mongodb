import { SORT_ORDER } from "../constants/index.js";

const parseSortOrder = (sortOrder) => {
    const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);

    if (isKnownOrder) return sortOrder;
    return SORT_ORDER.ASC;
};

const parseSortBy = (sortBy) => {
    const keyOfContacts = [
        '_id',
        'name',
        'phoneNumber',
        'email',
        'isFavourite',
        'contactType',
        'createdAt',
        'updatedAt',
    ];

    if (keyOfContacts.includes(sortBy)) {
        return sortBy;
    }

    return 'name';
};

const parseFilterType = (type) => {
    return type ? type : null;
};

const parseFilterIsFavourite = (isFavourite) => {
    if (isFavourite === 'true') {
        return true;
    } else if (isFavourite === 'false') {
        return false;
    } else {
        return null;
    }
};

export const parseSortParams = (query) => {
    const { sortOrder, sortBy, type, isFavourite } = query;

    const parsedSortOrder = parseSortOrder(sortOrder);
    const parsedSortBy = parseSortBy(sortBy);
    const parsedType = parseFilterType(type);
    const parsedIsFavourite = parseFilterIsFavourite(isFavourite);

    return {
        sortOrder: parsedSortOrder,
        sortBy: parsedSortBy,
        type: parsedType,
        isFavourite: parsedIsFavourite,
    };
};