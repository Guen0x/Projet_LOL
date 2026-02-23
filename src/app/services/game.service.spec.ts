import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should resolve champion ID to name', () => {
        // Jax has ID 24 in champion_info_2.json
        expect((service as any).champMap.get(24)).toBe('Jax');
    });

    it('should resolve summoner spell ID to name', () => {
        // Flash has ID 4 in summoner_spell_info.json
        expect((service as any).spellMap.get(4)).toBe('Flash');
    });

    it('should return fallback for unknown champion ID', () => {
        expect((service as any).resolveChamp(99999)).toBe('#99999');
    });

    it('should return fallback for unknown spell ID', () => {
        expect((service as any).resolveSpell(99999)).toBe('#99999');
    });

    it('should have loaded champions from JSON', () => {
        const champMap: Map<number, string> = (service as any).champMap;
        expect(champMap.size).toBeGreaterThan(100);
    });

    it('should have loaded summoner spells from JSON', () => {
        const spellMap: Map<number, string> = (service as any).spellMap;
        expect(spellMap.size).toBeGreaterThan(10);
    });
});
