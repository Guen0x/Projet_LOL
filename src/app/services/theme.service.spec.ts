import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
    let service: ThemeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeService);
        // Clean up body class
        document.body.classList.remove('light-theme');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start in dark mode', () => {
        expect(service.isDark()).toBe(true);
    });

    it('should toggle to light mode', () => {
        service.toggle();
        expect(service.isDark()).toBe(false);
        expect(document.body.classList.contains('light-theme')).toBe(true);
    });

    it('should toggle back to dark mode', () => {
        service.toggle(); // → light
        service.toggle(); // → dark
        expect(service.isDark()).toBe(true);
        expect(document.body.classList.contains('light-theme')).toBe(false);
    });
});
