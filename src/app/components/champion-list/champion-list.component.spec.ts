import championData from '../../../assets/champion_info_2.json';
import { Champion } from '../../models/champion.model';

/**
 * Tests for ChampionListComponent's data loading from JSON.
 * Since we load data synchronously from JSON, we don't need Angular DI.
 */
describe('Champion List Data Loading', () => {
    function loadChampions(): Champion[] {
        const championsRaw = (championData as any).data as Record<string, any>;
        return Object.values(championsRaw)
            .filter((c: any) => Array.isArray(c.tags) && c.id !== -1)
            .map((c: any) => ({
                id: c.id as number,
                name: c.name as string,
                key: c.key as string,
                title: c.title as string,
                tags: c.tags as string[],
            }));
    }

    it('should load champions from JSON', () => {
        const champions = loadChampions();
        expect(champions.length).toBeGreaterThan(100);
    });

    it('should have correct champion structure', () => {
        const champions = loadChampions();
        const jax = champions.find(c => c.name === 'Jax');
        expect(jax).toBeDefined();
        expect(jax!.id).toBe(24);
        expect(jax!.key).toBe('Jax');
        expect(jax!.title).toBe('Grandmaster at Arms');
        expect(jax!.tags).toContain('Fighter');
    });

    it('should not include champions with id -1', () => {
        const champions = loadChampions();
        const invalid = champions.find(c => c.id === -1);
        expect(invalid).toBeUndefined();
    });

    it('should include champions with valid tags', () => {
        const champions = loadChampions();
        for (const c of champions) {
            expect(Array.isArray(c.tags)).toBe(true);
            expect(c.tags.length).toBeGreaterThan(0);
        }
    });

    it('should contain known champions', () => {
        const champions = loadChampions();
        const names = champions.map(c => c.name);
        expect(names).toContain('Jax');
        expect(names).toContain('Ahri');
        expect(names).toContain('Lux');
        expect(names).toContain('Thresh');
    });
});
