import { ContactsCollection } from "../db/models/contact.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import { SORT_ORDER } from "../constants/index.js";

export const getAllContacts = async ({
    filter,
    page = 1,
    perPage = 10,
    sortOrder = SORT_ORDER.ASC,
    sortBy = 'name',
    userId,
}) => {
    const limit = perPage;
    const skip = (page - 1) * perPage;

    let contactsQuery = ContactsCollection.find({userId});
    const contactsCount = await ContactsCollection.find({userId})
        .merge(contactsQuery)
        .countDocuments();
    
    if (userId) {
        contactsQuery.where("userId").equals(userId);
    }
    
    if (filter.type) {
        contactsQuery = contactsQuery.where('contactType').equals(filter.type);
    }

    if (filter.favorite) {
        contactsQuery = contactsQuery.where('isFavourite').equals(filter.favorite);
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

export const createContact = async (payload) => {

    const contact = await ContactsCollection.create(payload);
    return contact;
};


export const updateContact = async (contactId, payload, userId, options = {}) => {
    const rawResult = await ContactsCollection.findOneAndUpdate(
        { _id: contactId, userId },
        payload,
        {
            new: true,
            includeResultMetadata: true,
            ...options,
        },
    );

    if (!rawResult || !rawResult.value) return null;

    return {
        contact: rawResult.value,
        isNew: Boolean(rawResult?.lastErrorObject?.upserted),
    };
};

export const deleteContact = async (contactId, userId) => {
    const deletedContact = await ContactsCollection.findOneAndDelete({
        _id: contactId,
        userId,
    });

    return deletedContact;
};