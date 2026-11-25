export interface CompressedImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
}

export function compressImageFile(file: File, maxDimension = 1024): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('The selected file is not a valid image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable for image processing.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
        resolve({
          dataUrl,
          base64: dataUrl.split(',')[1] ?? '',
          mimeType: 'image/jpeg',
        });
      };
      img.src = String(reader.result ?? '');
    };
    reader.readAsDataURL(file);
  });
}
