import imageCompression from 'browser-image-compression';

// Configuración de compresión - balance entre calidad y tamaño
const compressionOptions = {
  maxSizeMB: 0.5,          // Max 500KB por imagen
  maxWidthOrHeight: 1200,  // Redimensionar si es muy grande
  useWebWorker: true,      // No bloquear la UI
  fileType: 'image/jpeg',  // JPEG comprime mejor que PNG
  initialQuality: 0.85,    // 85% da buen balance
};

// Comprime imágenes pesadas manteniendo calidad visual
// Si la imagen ya es chica (<100KB) no la toca
export async function compressImage(file: File): Promise<File> {
  try {
    // No vale la pena comprimir archivos ya pequeños
    if (file.size < 100 * 1024) {
      console.log('Image is already small, skipping compression');
      return file;
    }

    console.log(`Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    const compressedFile = await imageCompression(file, compressionOptions);
    
    const originalSizeKB = file.size / 1024;
    const compressedSizeKB = compressedFile.size / 1024;
    const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    
    console.log(
      `Compression complete:\n` +
      `   Original: ${originalSizeKB.toFixed(2)}KB\n` +
      `   Compressed: ${compressedSizeKB.toFixed(2)}KB\n` +
      `   Reduction: ${reduction}%`
    );
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Si falla, mejor devolver la original que nada
    return file;
  }
}

// Comprime y convierte a base64 para guardar en localStorage
export async function compressAndConvertToBase64(file: File): Promise<string> {
  const compressedFile = await compressImage(file);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(compressedFile);
  });
}
