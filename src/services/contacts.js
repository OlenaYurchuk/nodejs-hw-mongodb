import { ContactsCollection } from "../db/models/contact.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import { SORT_ORDER } from "../constants/index.js";

export const getAllContacts = async ({
    page = 1,
    perPage = 10,
    sortOrder = SORT_ORDER.ASC,
    sortBy = 'name',
    type = null,
    isFavourite = null,
}) => {
    const limit = perPage;
    const skip = (page - 1) * perPage;

    let contactsQuery = ContactsCollection.find();
    const contactsCount = await ContactsCollection.find()
        .merge(contactsQuery)
        .countDocuments();
    
    if (type !== null) {
        contactsQuery = contactsQuery.where('contactType').equals(type);
    }

    if (isFavourite !== null) {
        contactsQuery = contactsQuery.where('isFavourite').equals(isFavourite);
    }
    
    const contacts = await contactsQuery
        .skip(skip)
        .limit(limit)
        .sort({[sortBy]: sortOrder})
        .exec();

    const paginaionData = calculatePaginationData(contactsCount, perPage, page);
    
    return {
        data: contacts,
        ...paginaionData,
    };
};

export const getContactById = async (contactId) => {
    const contact = await ContactsCollection.findById(contactId);
    return contact;
};

export const createContact = async (payload) => {

    const contact = await ContactsCollection.create(payload);
    return contact;
};


export const updateContact = async (contactId, payload, options = {}) => {
    const rawResult = await ContactsCollection.findByIdAndUpdate(
        { _id: contactId },
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

export const deleteContact = async (contactId) => {
    const deletedContact = await ContactsCollection.findOneAndDelete({
        _id: contactId,
    });

    return deletedContact;
};