export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('File could not be read'));
    reader.readAsDataURL(file);
  });
}

export function makeAbsoluteUploadUrl(pathLike) {
  if (!pathLike) return '';
  if (/^https?:\/\//i.test(pathLike)) return pathLike;
  return `${window.location.origin}${pathLike.startsWith('/') ? pathLike : `/${pathLike}`}`;
}

export function loadSavedImage(key) {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

export function saveImageLocally(key, dataUrl) {
  try {
    localStorage.setItem(key, dataUrl);
    return true;
  } catch {
    return false;
  }
}
