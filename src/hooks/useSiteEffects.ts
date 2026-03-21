import { useEffect } from 'react';
import { SiteConfig } from '../types';

interface UseSiteEffectsOptions {
  siteConfig: SiteConfig;
  onOpenAdmin: () => void;
}

/**
 * Centralizes all side effects related to site branding and global keyboard shortcuts.
 * - Updates document.title when siteName changes
 * - Updates the favicon when faviconUrl changes
 * - Registers Ctrl+Shift+A keyboard shortcut to open the admin panel
 */
export const useSiteEffects = ({ siteConfig, onOpenAdmin }: UseSiteEffectsOptions): void => {
  // Sync document title
  useEffect(() => {
    if (siteConfig.siteName) {
      document.title = siteConfig.siteName;
    }
  }, [siteConfig.siteName]);

  // Sync favicon
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (siteConfig.faviconUrl) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = siteConfig.faviconUrl;
    } else {
      if (link) {
        link.remove();
      }
    }
  }, [siteConfig.faviconUrl]);

  // Global keyboard shortcut: Ctrl+Shift+A → open admin
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        onOpenAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onOpenAdmin]);
};
