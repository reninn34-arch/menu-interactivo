import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compressImage, compressAndConvertToBase64 } from './imageCompression';

// Mock browser-image-compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn((file, _options) => {
    // Simulate compression by returning a smaller file
    const originalSize = file.size;
    const compressedSize = Math.floor(originalSize * 0.3); // 70% reduction
    
    return Promise.resolve(
      new File(
        [new Blob(['compressed-data'], { type: 'image/jpeg' })],
        file.name,
        { type: 'image/jpeg' }
      )
    );
  }),
}));

describe('imageCompression utilities', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('compressImage', () => {
    it('should compress large images', async () => {
      // Create a mock large file (1MB)
      const largeFile = new File(
        [new Blob(['x'.repeat(1024 * 1024)])],
        'test-image.jpg',
        { type: 'image/jpeg' }
      );

      const result = await compressImage(largeFile);

      expect(result).toBeInstanceOf(File);
      expect(result.type).toBe('image/jpeg');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Compressing image')
      );
    });

    it('should skip compression for small images (<100KB)', async () => {
      // Create a small file (50KB)
      const smallFile = new File(
        [new Blob(['x'.repeat(50 * 1024)])],
        'small-image.jpg',
        { type: 'image/jpeg' }
      );

      const result = await compressImage(smallFile);

      expect(result).toBe(smallFile); // Should return the same file
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Image is already small')
      );
    });

    it('should handle compression errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force an error by mocking a rejection
      const { default: imageCompression } = await import('browser-image-compression');
      vi.mocked(imageCompression).mockRejectedValueOnce(new Error('Compression failed'));

      const file = new File(
        [new Blob(['x'.repeat(200 * 1024)])],
        'test.jpg',
        { type: 'image/jpeg' }
      );

      const result = await compressImage(file);

      // Should return original file on error
      expect(result).toBe(file);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error compressing image'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('compressAndConvertToBase64', () => {
    it('should compress and convert image to base64', async () => {
      const file = new File(
        [new Blob(['test-image-data'])],
        'test.jpg',
        { type: 'image/jpeg' }
      );

      // Mock FileReader
      const mockReadAsDataURL = vi.fn(function(this: FileReader) {
        // Simulate FileReader behavior
        setTimeout(() => {
          Object.defineProperty(this, 'result', {
            value: 'data:image/jpeg;base64,dGVzdC1pbWFnZS1kYXRh',
            writable: false
          });
          if (this.onloadend) {
            this.onloadend(new ProgressEvent('loadend') as ProgressEvent<FileReader>);
          }
        }, 0);
      });

      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onloadend: ((event: ProgressEvent) => void) | null = null;
        onerror: ((event: ProgressEvent) => void) | null = null;
        result: string | null = null;
        readAsDataURL = mockReadAsDataURL;
      } as any;

      const result = await compressAndConvertToBase64(file);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/^data:image\/jpeg;base64,/);

      // Restore
      global.FileReader = originalFileReader;
    });

    it('should reject on FileReader error', async () => {
      const file = new File(
        [new Blob(['test-data'])],
        'test.jpg',
        { type: 'image/jpeg' }
      );

      // Mock FileReader to simulate error
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onloadend: ((event: ProgressEvent) => void) | null = null;
        onerror: ((event: ProgressEvent) => void) | null = null;
        result: string | null = null;
        readAsDataURL = vi.fn(function(this: FileReader) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new ProgressEvent('error') as ProgressEvent<FileReader>);
            }
          }, 0);
        });
      } as any;

      await expect(compressAndConvertToBase64(file)).rejects.toThrow('Failed to read file');

      // Restore
      global.FileReader = originalFileReader;
    });
  });
});
