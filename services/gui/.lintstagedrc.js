const path = require("path");

module.exports = {
  "src/**/*.{js,jsx,ts,tsx}": "eslint --fix",
  "**/*": "prettier --write --ignore-unknown",
};
