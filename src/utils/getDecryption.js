import { decrypt } from 'src/api/encryption';

export const decryptObjectKeys = (data) => {
  const decryptedData = data.map((item) => {
    const decryptedItem = {};
    Object.keys(item).forEach((key) => {
      decryptedItem[key] = decrypt(item[key]);
    });
    return decryptedItem;
  });
  return decryptedData;
};
