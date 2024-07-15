import createHttpError from "http-errors";
import {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
} from "../services/contacts.js";
import { parsePaginationParams } from "../utils/parsePaginationParams.js";
import { parseSortParams } from "../utils/parseSortParams.js";
import { parseContactFilterParams } from "../utils/parseContactFilterParams.js";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';

export const getContactsController = async (req, res, next) => {
    try { 
        const { _id: userId } = req.user;
        const { query } = req;
        const { page, perPage } = parsePaginationParams(query);
        const { sortBy, sortOrder} = parseSortParams(query);
        const filter = {...parseContactFilterParams(query), userId};

        const contacts = await getAllContacts({
            page, 
            perPage,
            sortBy,
            sortOrder,
            filter,
        });

           res.json({
            status: 200,
            message: 'Successfully found contacts!',
            contacts,
        });
    } catch(error) {
        next(error);
    }
};

export const getContactByIdController = async (req, res, next) => {
    const { _id: userId } = req.user;
    const { contactId } = req.params;
    const contact = await getContactById({_id: contactId, userId});

    if (!contact) {
        next(createHttpError(404, 'Contact not found'));
        return;
    }

    res.json({
        status: 200,
        message: `Successfully found contact with id ${contactId}`,
        contact,
    });
};

export const createContactController = async (req, res, next) => {
    const { _id: userId } = req.user;
    const { name, email, phoneNumber } = req.body;
    const photo = req.file;

    try {
        let photoUrl;

        if (photo) {
            if (env('ENABLE_CLOUDINARY') === 'true') {
                photoUrl = await saveFileToCloudinary(photo);
            } else {
                photoUrl = await saveFileToUploadDir(photo);
            }
        }
       
        const newContact = await createContact({userId, name, email, phoneNumber, photo: photoUrl});

        if (!newContact) {
            throw createHttpError(500, 'Failed to create contact');
        }

        res.status(201).json({
            status: 201,
            message: 'Successfully created a contact!',
            data: newContact,
        });
    } catch (error) {
        console.error('Error creating contact:', error);
        next(createHttpError(500, 'Failed to create contact'));
    }
};

export const patchContactController = async (req, res, next) => {
    const { _id: userId } = req.user;
    const { contactId } = req.params;
    
    try {
        const updatedContact = await updateContact({_id: contactId, userId}, req.body);

        if (!updatedContact) {
            next(createHttpError(404, 'Contact not found'));
            return;
        }

        res.status(200).json({
            status: 200,
            message: 'Successfully patched a contact!',
            data: updatedContact.contact,
        });
    } catch (error) {
        console.error(`Error patching contact with id ${contactId}`, error);
        next(createHttpError(500, 'Failed to patch contact!'));
   }
};

export const deleteContactController = async (req, res, next) => {
    const { _id: userId } = req.user;
    const { contactId } = req.params;

    try {
        const contact = await deleteContact({_id: contactId, userId});

            if (!contact) {
                return next(createHttpError(404, 'Contact not found', 
                    {
                        status: 404,
                        message: 'Contact not found',  
                    }
            ));
        }

        res.json({
            status: 200,
            message: 'Successfully deleted a contact!',
            data: contact,
        });
    } catch (error) {
        next(error);
    }
};
