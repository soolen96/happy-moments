import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface SpotifyPlaylist {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  url: string;
  safeEmbedUrl: SafeResourceUrl;
}

@Component({
  selector: 'app-spotify-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spotify-section.html',
  styleUrl: './spotify-section.css',
})
export class SpotifySectionComponent {
  private sanitizer = inject(DomSanitizer);

  currentIndex = 0;

  readonly playlists: SpotifyPlaylist[] = [
    {
      id: '5faD2eEbobKJcLuXj8FPvX',
      title: 'Lounge',
      badge: '🍸 Lounge',
      subtitle: 'Sonidos envolventes y relajantes para desconectar',
      url: 'https://open.spotify.com/playlist/5faD2eEbobKJcLuXj8FPvX?si=IvdpejH0T5yAF_jE0vi8BA&utm_source=copy-link&pi=RtTB5FLdS26gN',
      safeEmbedUrl: this.buildEmbedUrl('5faD2eEbobKJcLuXj8FPvX'),
    },
    {
      id: '0u2UTxII04surKKxhcFJh7',
      title: 'Rockcito suave 🍃🎸',
      badge: '🍃 Rockcito Suave',
      subtitle: 'Melodías acústicas y acordes para disfrutar el momento',
      url: 'https://open.spotify.com/playlist/0u2UTxII04surKKxhcFJh7?si=-lXk7m-PQCK5K3Sh6b9Jpw&utm_source=copy-link&pi=-as14hoVQKGeN',
      safeEmbedUrl: this.buildEmbedUrl('0u2UTxII04surKKxhcFJh7'),
    },
    {
      id: '7avlVw6XMrYHQdZUocaM1f',
      title: 'Chill vibes 🍂✨🙂‍↔️',
      badge: '✨ Chill Vibes',
      subtitle: 'Atmósferas tranquilas pensadas para acompañar tu vibra',
      url: 'https://open.spotify.com/playlist/7avlVw6XMrYHQdZUocaM1f?si=9Ug1YHvRRiK19UQzgwt1ow&utm_source=copy-link&pi=9cRFMeQhRJm4E',
      safeEmbedUrl: this.buildEmbedUrl('7avlVw6XMrYHQdZUocaM1f'),
    },
    {
      id: '6mOQDgEn7COZBhnTZXwKvb',
      title: 'Música para mi gato 😺🍃',
      badge: '😺 Para Mi Gato',
      subtitle: 'Vibras sutiles y acogedoras en armonía',
      url: 'https://open.spotify.com/playlist/6mOQDgEn7COZBhnTZXwKvb?si=zlIVZE2IThKCtZRVtOPqqA&utm_source=copy-link&pi=o7vNA-84Sma05',
      safeEmbedUrl: this.buildEmbedUrl('6mOQDgEn7COZBhnTZXwKvb'),
    },
    {
      id: '6ajuudvGnLZIpuNBItvUSy',
      title: 'Stereo vibes 🙂‍↔️🎸👽',
      badge: '👽 Stereo Vibes',
      subtitle: 'Ondas estéreo y texturas sonoras sensoriales',
      url: 'https://open.spotify.com/playlist/6ajuudvGnLZIpuNBItvUSy?si=yWYb9LCkQ8yC4Mqmf2H-4g&utm_source=copy-link&pi=QbqlcsV4TQWzZ',
      safeEmbedUrl: this.buildEmbedUrl('6ajuudvGnLZIpuNBItvUSy'),
    },
    {
      id: '4E3qk3GFokwRYAPiFVbvCW',
      title: 'Chill Rock 🎸🍃',
      badge: '🎸 Chill Rock',
      subtitle: 'Guitarras con groove pausado y esencia libre',
      url: 'https://open.spotify.com/playlist/4E3qk3GFokwRYAPiFVbvCW?si=YADGD5j2SKCM9p40HmDjqQ&utm_source=copy-link&pi=p9-MF3DDSW2h',
      safeEmbedUrl: this.buildEmbedUrl('4E3qk3GFokwRYAPiFVbvCW'),
    },
    {
      id: '4FbdPdnis97hmG1XZiNVKd',
      title: 'Emomaniaco 😵😵😵',
      badge: '😵 Emomaniaco',
      subtitle: 'Intensidad lírica y energía catártica',
      url: 'https://open.spotify.com/playlist/4FbdPdnis97hmG1XZiNVKd?si=M5ASB_vJRGSMaR8ZzqZ9oA&utm_source=copy-link',
      safeEmbedUrl: this.buildEmbedUrl('4FbdPdnis97hmG1XZiNVKd'),
    },
    {
      id: '7gIR0OZS73zZ67IMUvunGX',
      title: '🚬 Rap y Hierbas 🚬',
      badge: '🚬 Rap y Hierbas',
      subtitle: 'Beats precisos y líricas profundas con flow natural',
      url: 'https://open.spotify.com/playlist/7gIR0OZS73zZ67IMUvunGX?si=rTb-Y-RfRl6NdTmSbTxSiA&utm_source=copy-link',
      safeEmbedUrl: this.buildEmbedUrl('7gIR0OZS73zZ67IMUvunGX'),
    },
  ];

  get currentPlaylist(): SpotifyPlaylist {
    return this.playlists[this.currentIndex];
  }

  prevPlaylist(): void {
    this.currentIndex = (this.currentIndex - 1 + this.playlists.length) % this.playlists.length;
  }

  nextPlaylist(): void {
    this.currentIndex = (this.currentIndex + 1) % this.playlists.length;
  }

  setPlaylist(index: number): void {
    if (index >= 0 && index < this.playlists.length) {
      this.currentIndex = index;
    }
  }

  private buildEmbedUrl(playlistId: string): SafeResourceUrl {
    const url = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
