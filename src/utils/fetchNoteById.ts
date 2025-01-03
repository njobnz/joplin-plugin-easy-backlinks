import joplin from 'api';
import { JoplinNote } from '../types';

/**
 * Fetches a note by its ID and retrieves the specific fields.
 *
 * @param {string} noteId - The ID of the note to fetch.
 * @param {string[]} fields - An array of field names to include in the fetched note data.
 * @returns {Promise<JoplinNote>} The note data with the specified fields.
 */
export default async (noteId: string, fields: string[] = ['id']): Promise<JoplinNote> => {
  try {
    return await joplin.data.get(['notes', noteId], { fields });
  } catch (e) {
    return null;
  }
};
