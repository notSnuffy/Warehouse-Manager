/**
 * Capitalizes the first letter of a given string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The string with the first letter capitalized.
 */
function capitalizeFirstLetter(str) {
  if (typeof str !== "string" || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export { capitalizeFirstLetter };
