/**
 * Upload Helper - Centralized upload functionality
 * Converts files to base64 data URLs for Vercel compatibility
 */

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const BACKEND_URL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

export async function uploadImage(file) {
  try {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // Convert file to base64 data URL directly (client-side)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64DataUrl = event.target.result; // format: data:image/...;base64,...
        console.log('✅ Image converted to base64 (size:', base64DataUrl.length, 'bytes)');
        resolve(base64DataUrl);
      };
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function uploadResume(file) {
  try {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // Convert resume to base64 data URL directly
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64DataUrl = event.target.result;
        console.log('✅ Resume converted to base64');
        resolve(base64DataUrl);
      };
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    throw error;
  }
}

export async function uploadTeamPhoto(file, onProgress) {
  try {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    const formData = new FormData();
    const fileName = file.name || `team-photo-${Date.now()}.jpg`;
    formData.append('image', file, fileName);

    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BACKEND_URL}/api/uploads/team-photo`, true);

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        if (typeof onProgress === 'function') {
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url);
          } catch (parseError) {
            reject(parseError);
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || 'Erreur upload photo'));
          } catch {
            reject(new Error('Erreur upload photo'));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Erreur upload photo'));
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Team photo upload error:', error);
    throw error;
  }
}
