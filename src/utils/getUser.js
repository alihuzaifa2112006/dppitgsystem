// utils/localStorageHelper.js

import { decryptObjectKeys } from "./getDecryption";


export const getUserData = () => {
  try {
    const userData = localStorage.getItem('UserData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting UserData from session storage:', error);
    return null;
  }
};

export const getDecryptedUserData = () => {
  try {
    const userData = getUserData();
    if (userData) {
      return decryptObjectKeys(userData); // userData is an array of objects
    }
    return null;
  } catch (error) {
    console.error('Error decrypting UserData from session storage:', error);
    return null;
  }
};
