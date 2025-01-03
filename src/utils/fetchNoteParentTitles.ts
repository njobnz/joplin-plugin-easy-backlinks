import joplin from 'api';
import { JoplinNote } from '../types';

/**
 * Fetches the titles of parent folders for a given note up to a specified depth.
 *
 * @param {string} note - The note to fetch parent folder titles for
 * @param {number} depth - Parent depth to fetch (default: 1)
 *                1: immediate parent, >1: multiple levels, -1: all parents
 * @returns {Promise<string[]>} Array of parent folder titles from root to immediate parent
 */
export default async (note: JoplinNote, depth: number = 1): Promise<string[]> => {
  const results: string[] = [];

  let parentId = note?.parent_id;
  while (parentId && parentId !== '' && depth > -1) {
    if (depth !== 0) depth = depth === 1 ? -1 : depth - 1;

    try {
      const folder = await joplin.data.get(['folders', parentId], { fields: ['title', 'parent_id'] });
      results.unshift(folder['title']);
      parentId = folder.parent_id;
    } catch (error) {
      console.error('Error fetching note parent:', error, note);
      break;
    }
  }

  return results;
};
