import joplin from 'api';
import { JoplinNote } from '../types';

/**
 * Fetches notes from Joplin's API with optional query, fields, and result limit.
 *
 * @param {string} path - The API endpoint path to fetch notes from
 * @param {string} query - Optional search query to filter the results
 * @param {string[]} fields - Optional array of field names to retrieve (defaults to ['id', 'parent_id', 'title'])
 * @param {number} limit - Optional maximum number of notes to fetch (0 = no limit)
 * @returns {Promise<JoplinNote[]>} Array of Notes fetched from the API
 */
export default async (path: string[], query?: string, fields?: string[], limit: number = 0): Promise<JoplinNote[]> => {
  const results: JoplinNote[] = [];

  for (let page = 1; ; page++) {
    try {
      const { items, has_more } = await joplin.data.get(path, {
        page,
        fields: fields ?? ['id', 'parent_id', 'title'],
        ...(query && { query }),
      });
      results.push(...items);
      if (!has_more || (limit > 0 && results.length >= limit)) break;
    } catch (error) {
      console.error('Error fetching notes:', error, path, query, fields);
      break;
    }
  }

  return results;
};
