import createHttpError from "http-errors";
import {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
} from "../services/contacts.js";

export const getContactsController = async (req, res, next) => {
    try { 
        const contacts = await getAllContacts();

           res.json({
            status: 200,
            message: 'Successfully found contacts!',
            data: contacts,
        });
    } catch(error) {
        next(error);
    }
};

export const getContactByIdController = async (req, res, next) => {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);

    if (!contact) {
        next(createHttpError(404, 'Contact not found'));
        return;
    }

    res.json({
        status: 200,
        message: `Successfully found contact with id ${contactId}`,
        data: contact,
    });
};

export const createContactController = async (req, res, next) => {
    const { name, phoneNumber, email, isFavourite, contactType } = req.body;


    if (!name || !phoneNumber) {
        next(createHttpError(400, 'Name and phoneNamber are required'));
        return;
    }

    try {
        const contact = await createContact({
        name,
        phoneNumber,
        email,
        isFavourite,
        contactType
        });

        res.status(201).json({
            status: 201,
            message: 'Successfully created a contact!',
            data: contact,
        });
    } catch (error) {
        next(error);
    }
};

export const patchContactController = async (req, res, next) => {
    const { contactId } = req.params;
    try {
        const result = await updateContact(contactId, req.body);

        if (!result) {
            next(createHttpError(404, 'Contact not found'));
            return;
        }

        res.status(200).json({
            status: 200,
            message: 'Successfully patched a contact!',
            data: result.contact,
        });
    } catch (error) {
        console.error(`Error patching contact with id ${contactId}`, error);
        next(createHttpError(500, 'Failed to patch contact!'));
   }
};

export const deleteContactController = async (req, res, next) => {
    const { contactId } = req.params;

    try {
        const contact = await deleteContact(contactId);

            if (!contact) {
                return next(createHttpError(404, 'Contact not found', 
                    {
                        status: 404,
                        message: 'Contact not found',
                        data: { message: 'Contact not found' },
                }
            ));
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};