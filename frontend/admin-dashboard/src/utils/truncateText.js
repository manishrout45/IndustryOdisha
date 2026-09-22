// src/utils/truncateText.js

export const truncateText = (text, length = 100) => {
  return text.length > length
    ? text.substring(0, length) + "..."
    : text;
};