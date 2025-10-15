/**
 * Escape HTML entities in a string
 *
 * @param {string} input - The HTML string to escape
 * @returns {string} The escaped input string
 */
export default (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
