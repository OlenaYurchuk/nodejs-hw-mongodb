import { ContactsCollection } from "../db/models/contact.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import { SORT_ORDER } from "../constants/index.js";

export const getAllContacts = async ({
    filter,
    page = 1,
    perPage = 10,
    sortOrder = SORT_ORDER.ASC,
    sortBy = 'name',
}) => {
    const limit = perPage;
    const skip = (page - 1) * perPage;

    const contactsQuery = ContactsCollection.find();
    const contactsCount = await ContactsCollection.find()
        .merge(contactsQuery)
        .countDocuments();
    
    if (filter.userId) {
        contactsQuery.where("userId").equals(filter.userId);
    }
    
    if (filter.type) {
        contactsQuery.where('contactType').equals(filter.type);
    }

    if (filter.favorite) {
        contactsQuery.where('isFavourite').equals(filter.favorite);
    }
    
    const contacts = await contactsQuery
        .skip(skip)
        .limit(limit)
        .sort({[sortBy]: sortOrder})
        .exec();

    const paginaionData = calculatePaginationData(contactsCount, perPage, page);
    
    return {
        contacts,
        ...paginaionData,
    };
};

export const getContactById = filter => ContactsCollection.findOne(filter);

export const createContact = contact => ContactsCollection.create(contact);


export const updateContact = async (filter, contact, options = {}) => {
    const rawResult = await ContactsCollection.findOneAndUpdate(
        filter,
        contact,
        {
            includeResultMetadata: true,
            ...options,
        },
    );

    if (!rawResult || !rawResult.value) return null;

    const isNew = Boolean(rawResult?.lastErrorObject?.upserted);

    return {
        data: rawResult.value,
        isNew,
    };
};

export const deleteContact = filter => ContactsCollection.findOneAndDelete(filter);