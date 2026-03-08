import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { compressAndConvertToBase64 } from '../../utils/imageCompression';

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
}

export const ImageUploader = ({ currentImage, onImageChange, label = 'Imagen' }: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        setIsCompressing(true);
        const compressedBase64 = await compressAndConvertToBase64(file);
        setPreview(compressedBase64);
        onImageChange(compressedBase64);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('❌ Error al procesar la imagen. Por favor intenta con otra.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUrlInput = (url: string) => {
    setPreview(url);
    onImageChange(url);
  };

  const clearImage = () => {
    setPreview('');
    onImageChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      
      {/* Preview */}
      {preview && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-800 border border-gray-700"
        >
          <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </motion.div>
      )}

      {/* Upload Area */}
      {!preview && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging 
              ? 'border-orange-500 bg-orange-500/10' 
              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            className="hidden"
            disabled={isCompressing}
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
              {isCompressing ? (
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              ) : isDragging ? (
                <Upload className="w-8 h-8 text-orange-500 animate-bounce" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            <div className="space-y-2">
              {isCompressing ? (
                <p className="text-sm text-orange-500 font-medium">
                  Comprimiendo imagen...
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-300">
                    Arrastra una imagen aquí o{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-orange-500 hover:text-orange-400 font-medium"
                      disabled={isCompressing}
                    >
                      examina
                    </button>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF - Se optimizará automáticamente</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* URL Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="O pega una URL de imagen..."
          value={preview}
          onChange={(e) => handleUrlInput(e.target.value)}
          disabled={isCompressing}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
