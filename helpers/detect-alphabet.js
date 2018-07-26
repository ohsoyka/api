const englishAlphabet = 'abcdefghijklmnopqrstuvwxyz';
const ukrainianAlphabet = 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя';

module.exports = (string) => {
  const chars = string.toString().split('').map(char => char.toLowerCase());
  const englishChars = chars.filter(char => englishAlphabet.includes(char));
  const ukrainianChars = chars.filter(char => ukrainianAlphabet.includes(char));

  if (englishChars.length === ukrainianChars.length) {
    return null;
  }

  return ukrainianChars.length > englishChars ? 'ukr' : 'eng';
};
