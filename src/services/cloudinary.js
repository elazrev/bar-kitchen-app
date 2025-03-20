// שירות להעלאת תמונות ל-Cloudinary

// קבועים שיש להחליף בערכים האמיתיים מלוח הבקרה של Cloudinary
const CLOUD_NAME = "dw3r96sbl";
const UPLOAD_PRESET = "bar-kitchen-app"; // הגדר preset לא מאובטח ב-Cloudinary

/**
 * העלאת תמונה ל-Cloudinary
 * @param {File} imageFile - קובץ התמונה להעלאה
 * @returns {Promise<string>} - כתובת ה-URL של התמונה שהועלתה
 */
export const uploadImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error('שגיאה בהעלאת התמונה');
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('שגיאה בשירות העלאת התמונות:', error);
    throw error;
  }
};

/**
 * יצירת כתובת URL עם שינוי גודל תמונה
 * @param {string} imageUrl - כתובת ה-URL המקורית
 * @param {number} width - רוחב רצוי בפיקסלים
 * @param {number} height - גובה רצוי בפיקסלים
 * @returns {string} - כתובת URL מותאמת
 */
export const getResizedImageUrl = (imageUrl, width = 300, height = 300) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl; // אם זו לא כתובת Cloudinary, החזר את המקור
  }
  
  // החלף את הפרמטרים בכתובת ה-URL
  return imageUrl.replace('/upload/', `/upload/c_fill,w_${width},h_${height}/`);
};