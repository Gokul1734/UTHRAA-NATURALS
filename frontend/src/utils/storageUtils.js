/**
 * Storage utilities for user-specific cart and wishlist data
 */

/**
 * Get the current user ID from session storage
 * @returns {string|null} User ID or null if not authenticated
 */
export const getCurrentUserId = () => {
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  return user?._id || null;
};

/**
 * Get user-specific storage key
 * @param {string} baseKey - Base storage key (e.g., 'cartItems', 'wishlistItems')
 * @returns {string} User-specific storage key
 */
export const getUserStorageKey = (baseKey) => {
  const userId = getCurrentUserId();
  return userId ? `${baseKey}_${userId}` : baseKey;
};

/**
 * Get data from localStorage with user-specific key
 * @param {string} baseKey - Base storage key
 * @param {any} defaultValue - Default value if no data found
 * @returns {any} Stored data or default value
 */
export const getUserStorageData = (baseKey, defaultValue = null) => {
  try {
    const key = getUserStorageKey(baseKey);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error reading from user storage:', error);
    return defaultValue;
  }
};

/**
 * Set data in localStorage with user-specific key
 * @param {string} baseKey - Base storage key
 * @param {any} data - Data to store
 */
export const setUserStorageData = (baseKey, data) => {
  try {
    const key = getUserStorageKey(baseKey);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to user storage:', error);
  }
};

/**
 * Remove data from localStorage with user-specific key
 * @param {string} baseKey - Base storage key
 */
export const removeUserStorageData = (baseKey) => {
  try {
    const key = getUserStorageKey(baseKey);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from user storage:', error);
  }
};

/**
 * Clear all user-specific data for the current user
 */
export const clearUserData = () => {
  const userId = getCurrentUserId();
  if (!userId) return;

  // Get all keys from localStorage
  const keys = Object.keys(localStorage);
  
  // Remove keys that belong to this user
  keys.forEach(key => {
    if (key.includes(`_${userId}`)) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Migrate old storage data to user-specific storage
 * @param {string} baseKey - Base storage key
 * @param {any} defaultValue - Default value
 * @returns {any} Migrated data
 */
export const migrateToUserStorage = (baseKey, defaultValue = null) => {
  const userId = getCurrentUserId();
  if (!userId) return defaultValue;

  try {
    // Check if old data exists
    const oldData = localStorage.getItem(baseKey);
    if (oldData) {
      const parsedData = JSON.parse(oldData);
      
      // Move to user-specific storage
      setUserStorageData(baseKey, parsedData);
      
      // Remove old data
      localStorage.removeItem(baseKey);
      
      console.log(`Migrated ${baseKey} data to user-specific storage for user ${userId}`);
      return parsedData;
    }
  } catch (error) {
    console.error('Error migrating storage data:', error);
  }

  return defaultValue;
};

/**
 * Get all user-specific storage keys for debugging
 * @returns {string[]} Array of user-specific storage keys
 */
export const getUserStorageKeys = () => {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const keys = Object.keys(localStorage);
  return keys.filter(key => key.includes(`_${userId}`));
}; 