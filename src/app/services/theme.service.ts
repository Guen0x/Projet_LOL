import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    isDark = signal(true);

    toggle(): void {
        this.isDark.update((v) => !v);
        document.body.classList.toggle('light-theme', !this.isDark());
    }
}
