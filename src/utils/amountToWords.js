import { toWords } from 'number-to-words';

const capitalizeEachWord = (str) =>
  str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const amountToWords = (amount) => {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return 'Zero Dollars';
  }

  const amountNumber = parseFloat(amount);
  if (amountNumber === 0) return 'Zero Dollars';

  const dollars = Math.floor(amountNumber);
  const cents = Math.round((amountNumber - dollars) * 100);

  // eslint-disable-next-line
  let result = capitalizeEachWord(toWords(dollars)) + ' Dollar' + (dollars !== 1 ? 's' : '');

  if (cents > 0) {
    // eslint-disable-next-line
    result += ' and ' + capitalizeEachWord(toWords(cents)) + ' Cent' + (cents !== 1 ? 's' : '');
  }

  return result;
};

export const amountToWordsInBDT = (amount) => {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return 'Zero Taka';
  }

  const amountNumber = parseFloat(amount);
  if (amountNumber === 0) return 'Zero Taka';

  const taka = Math.floor(amountNumber);
  const paisa = Math.round((amountNumber - taka) * 100);
  // eslint-disable-next-line
  let result = capitalizeEachWord(toWords(taka)) + ' Taka' + (taka !== 1 ? '' : '');

  if (paisa > 0) {
    // eslint-disable-next-line
    result += ' and ' + capitalizeEachWord(toWords(paisa)) + ' Paisa' + (paisa !== 1 ? '' : '');
  }

  return result;
};

export const amountinBDTWords = amountToWordsInBDT;
