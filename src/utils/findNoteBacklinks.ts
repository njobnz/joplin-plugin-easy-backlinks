import { BacklinksListOrder, BacklinksListSort } from '../constants';
import { JoplinNote } from '../types';
import fetchNotes from './fetchNotes';

/**
 * Finds all notes that backlink to the given note and excludes ignored notes.
 *
 * @param {string} noteId - The note ID to search for backlinks.
 * @param {string[]} ignoreList - A list of note IDs to ignore.
 * @param {string} ignoreText - Notes with this text will be ignored.
 * @param {string} sortField - Note property to sort by (default: '').
 * @param {number} sortOrder - Order to sort by (0 = ascending, 1 = descending).
 * @returns {Promise<JoplinNote[]>} Array of backlinked notes.
 */
export default async (
  noteId: string,
  ignoreList: string[],
  ignoreText: string,
  sortField: BacklinksListSort = BacklinksListSort.Default,
  sortOrder: BacklinksListOrder = BacklinksListOrder.Ascending
): Promise<JoplinNote[]> => {
  if (!ignoreList && !ignoreList.length) ignoreList = [];

  const fields = ['id', 'parent_id', 'title', 'body'];
  if (sortField) fields.push(sortField);

  const notes = noteId
    ? (await fetchNotes(['search'], noteId, fields)).filter(
        item => !ignoreList.includes(item.id) && ignoreText && !item.body.includes(ignoreText)
      )
    : [];

  if (!sortField && sortOrder !== BacklinksListOrder.Ascending) {
    notes.reverse();
  } else {
    notes.sort((a, b) => {
      const order = sortOrder === BacklinksListOrder.Ascending ? 1 : -1;

      const aValue = a[sortField as keyof JoplinNote];
      const bValue = b[sortField as keyof JoplinNote];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * order;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * order;
      }

      return 0;
    });
  }

  return notes;
};
