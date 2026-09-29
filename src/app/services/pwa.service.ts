import { Injectable, signal, computed } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private readonly DISMISS_STORAGE_KEY = 'happy_moments_pwa_banner_dismissed';
  private readonly DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Reactive state
  canInstall = signal<boolean>(false);
  isInstalled = signal<boolean>(false);
  isIos = signal<boolean>(false);
  isAndroid = signal<boolean>(false);
  isMobile = signal<boolean>(false);
  showInstallBanner = signal<boolean>(false);
  showInstallModal = signal<boolean>(false);
  installedSuccess = signal<boolean>(false);

  // Computed helper
  isEligibleForInstall = computed(() => {
    return !this.isInstalled() && (this.canInstall() || this.isIos());
  });

  constructor() {
    this.initPwa();
  }

  private initPwa(): void {
    if (typeof window === 'undefined') return;

    this.checkPlatform();
    this.checkStandalone();
    this.registerServiceWorker();
    this.listenToInstallEvents();
  }

  private checkPlatform(): void {
    if (typeof navigator === 'undefined') return;

    const ua = navigator.userAgent || '';
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(typeof window !== 'undefined' && (window as any)?.MSStream);
    const isAndroidDevice = /Android/i.test(ua);
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    this.isIos.set(isIosDevice);
    this.isAndroid.set(isAndroidDevice);
    this.isMobile.set(isMobileDevice);
  }

  private checkStandalone(): void {
    if (typeof window === 'undefined') return;

    const isMatchMediaSupported = typeof window.matchMedia === 'function';
    const isStandaloneMode =
      (isMatchMediaSupported && window.matchMedia('(display-mode: standalone)').matches) ||
      (typeof navigator !== 'undefined' && (navigator as any)?.standalone === true) ||
      (typeof document !== 'undefined' && typeof document.referrer === 'string' && document.referrer.includes('android-app://'));

    this.isInstalled.set(Boolean(isStandaloneMode));

    if (isStandaloneMode) {
      this.showInstallBanner.set(false);
      this.canInstall.set(false);
      return;
    }

    // If on iOS and not standalone, user CAN install via Safari share menu
    if (this.isIos()) {
      this.canInstall.set(true);
      this.scheduleBanner();
    }
  }

  private registerServiceWorker(): void {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
          });
      });
    }
  }

  private listenToInstallEvents(): void {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Prevent the default browser mini-infobar on mobile
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.canInstall.set(true);

      // Only show banner if not recently dismissed
      this.scheduleBanner();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isInstalled.set(true);
      this.canInstall.set(false);
      this.showInstallBanner.set(false);
      this.showInstallModal.set(false);
      this.installedSuccess.set(true);

      setTimeout(() => {
        this.installedSuccess.set(false);
      }, 5000);

      console.log('[PWA] App successfully installed!');
    });
  }

  private scheduleBanner(): void {
    if (this.isInstalled() || this.isBannerDismissedRecently()) {
      return;
    }

    // Show after slight delay to ensure first paint and nice UX
    setTimeout(() => {
      if (!this.isInstalled()) {
        this.showInstallBanner.set(true);
      }
    }, 2500);
  }

  private isBannerDismissedRecently(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      const dismissedAt = localStorage.getItem(this.DISMISS_STORAGE_KEY);
      if (!dismissedAt) return false;
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      return elapsed < this.DISMISS_DURATION_MS;
    } catch {
      return false;
    }
  }

  async promptInstall(): Promise<void> {
    if (this.deferredPrompt) {
      // Native Chrome/Edge/Samsung Internet prompt
      try {
        await this.deferredPrompt.prompt();
        const choice = await this.deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          this.isInstalled.set(true);
          this.showInstallBanner.set(false);
          this.showInstallModal.set(false);
        }
        this.deferredPrompt = null;
      } catch (err) {
        console.error('[PWA] Error launching install prompt:', err);
      }
    } else {
      // If iOS or deferred prompt is not available, open visual guide modal
      this.openInstallModal();
    }
  }

  openInstallModal(): void {
    this.showInstallModal.set(true);
  }

  closeInstallModal(): void {
    this.showInstallModal.set(false);
  }

  dismissBanner(): void {
    this.showInstallBanner.set(false);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.DISMISS_STORAGE_KEY, Date.now().toString());
      }
    } catch (e) {
      console.warn('[PWA] Could not save dismiss state to localStorage');
    }
  }
}
