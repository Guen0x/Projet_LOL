/**
 * Tests for ChampionDetailComponent's pure logic methods.
 * We test computeStats and computeMatchups by calling them directly
 * with mock game data, bypassing the fetch/template complexity.
 */
import { ChampionDetailComponent } from './champion-detail.component';
import { Game, GameTeam } from '../../models/game.model';

function makeTeam(champions: string[], bans: string[] = []): GameTeam {
    return {
        champions,
        summonerSpells: [],
        towerKills: 0,
        inhibitorKills: 0,
        baronKills: 0,
        dragonKills: 0,
        riftHeraldKills: 0,
        bans: bans.length ? bans : ['—', '—', '—', '—', '—'],
    };
}

function makeGame(team1Champs: string[], team2Champs: string[], winner: 1 | 2, duration = 1800, bans1: string[] = [], bans2: string[] = []): Game {
    return {
        gameId: Math.floor(Math.random() * 100000),
        creationTime: Date.now(),
        gameDuration: duration,
        seasonId: 9,
        winner,
        firstBlood: 1,
        firstTower: 1,
        firstInhibitor: 0,
        firstBaron: 0,
        firstDragon: 1,
        firstRiftHerald: 0,
        team1: makeTeam(team1Champs, bans1),
        team2: makeTeam(team2Champs, bans2),
    };
}

describe('ChampionDetailComponent (Logic)', () => {
    let component: ChampionDetailComponent;

    beforeEach(() => {
        // Create component instance without Angular DI
        component = new (ChampionDetailComponent as any)(
            { snapshot: { paramMap: { get: () => '24' } } }, // mock ActivatedRoute
            { detectChanges: () => { } } // mock ChangeDetectorRef
        );
    });

    describe('computeStats', () => {
        it('should compute correct win rate', () => {
            const games: Game[] = [
                makeGame(['Jax', 'Lux', 'Ahri', 'Jinx', 'Thresh'], ['Brand', 'Zed', 'Lulu', 'Vayne', 'Lee Sin'], 1),
                makeGame(['Jax', 'Lux', 'Ahri', 'Jinx', 'Thresh'], ['Brand', 'Zed', 'Lulu', 'Vayne', 'Lee Sin'], 2),
                makeGame(['Jax', 'Lux', 'Ahri', 'Jinx', 'Thresh'], ['Brand', 'Zed', 'Lulu', 'Vayne', 'Lee Sin'], 1),
            ];
            const stats = (component as any).computeStats('Jax', games);
            expect(stats.gamesPlayed).toBe(3);
            expect(stats.wins).toBe(2);
            expect(stats.losses).toBe(1);
            expect(stats.winRate).toBe(66.7);
        });

        it('should compute pick rate', () => {
            const games: Game[] = [
                makeGame(['Jax', 'Lux', 'Ahri', 'Jinx', 'Thresh'], ['Brand', 'Zed', 'Lulu', 'Vayne', 'Lee Sin'], 1),
                makeGame(['Brand', 'Lux', 'Ahri', 'Jinx', 'Thresh'], ['Zed', 'Lulu', 'Vayne', 'Lee Sin', 'Aatrox'], 1),
            ];
            const stats = (component as any).computeStats('Jax', games);
            expect(stats.gamesPlayed).toBe(1);
            expect(stats.pickRate).toBe(50);
        });

        it('should compute ban rate', () => {
            const games: Game[] = [
                makeGame(['Jax', 'Lux', 'Ahri', 'Jinx', 'Thresh'], ['Brand', 'Zed', 'Lulu', 'Vayne', 'Lee Sin'], 1, 1800, ['Jax'], []),
                makeGame(['Brand', 'Lux', 'Ahri', 'Jinx', 'Thresh'], ['Zed', 'Lulu', 'Vayne', 'Lee Sin', 'Aatrox'], 1, 1800, [], ['Jax']),
                makeGame(['Brand', 'Lux', 'Ahri', 'Jinx', 'Thresh'], ['Zed', 'Lulu', 'Vayne', 'Lee Sin', 'Aatrox'], 1),
            ];
            const stats = (component as any).computeStats('Jax', games);
            expect(stats.banRate).toBe(66.7);
        });

        it('should compute average game duration', () => {
            const games: Game[] = [
                makeGame(['Jax', 'Lux', 'Ahri', 'Jinx', 'Thresh'], ['Brand', 'Zed', 'Lulu', 'Vayne', 'Lee Sin'], 1, 1800),
                makeGame(['Jax', 'Lux', 'Ahri', 'Jinx', 'Thresh'], ['Brand', 'Zed', 'Lulu', 'Vayne', 'Lee Sin'], 1, 2400),
            ];
            const stats = (component as any).computeStats('Jax', games);
            // (1800 + 2400) / 2 = 2100 -> 35:00
            expect(stats.avgGameDuration).toBe('35:00');
        });

        it('should handle zero games', () => {
            const stats = (component as any).computeStats('NonExistent', []);
            expect(stats.gamesPlayed).toBe(0);
            expect(stats.winRate).toBe(0);
            expect(stats.pickRate).toBe(0);
        });
    });

    describe('computeMatchups', () => {
        it('should compute best and worst matchups', () => {
            const games: Game[] = [];
            // 15 games vs Brand, Jax wins 12
            for (let i = 0; i < 15; i++) {
                games.push(makeGame(
                    ['Jax', 'Lux', 'Ahri', 'Jinx', 'Thresh'],
                    ['Brand', 'Zed', 'Lulu', 'Vayne', 'Lee Sin'],
                    i < 12 ? 1 : 2
                ));
            }
            // 15 games vs Darius, Jax wins 3
            for (let i = 0; i < 15; i++) {
                games.push(makeGame(
                    ['Jax', 'Lux', 'Ahri', 'Jinx', 'Thresh'],
                    ['Darius', 'Zed', 'Lulu', 'Vayne', 'Lee Sin'],
                    i < 3 ? 1 : 2
                ));
            }

            (component as any).computeMatchups('Jax', games);

            expect(component.bestMatchups.length).toBeGreaterThan(0);
            expect(component.worstMatchups.length).toBeGreaterThan(0);

            // Brand should be in best matchups (80% WR)
            const brandMatchup = component.bestMatchups.find(m => m.name === 'Brand');
            expect(brandMatchup).toBeDefined();
            expect(brandMatchup!.winRate).toBe(80);

            // Darius should be in worst matchups (20% WR)
            const dariusMatchup = component.worstMatchups.find(m => m.name === 'Darius');
            expect(dariusMatchup).toBeDefined();
            expect(dariusMatchup!.winRate).toBe(20);
        });

        it('should filter out matchups with fewer than 10 games', () => {
            const games: Game[] = [];
            // Only 5 games vs Brand
            for (let i = 0; i < 5; i++) {
                games.push(makeGame(
                    ['Jax', 'Lux', 'Ahri', 'Jinx', 'Thresh'],
                    ['Brand', 'Zed', 'Lulu', 'Vayne', 'Lee Sin'],
                    1
                ));
            }

            (component as any).computeMatchups('Jax', games);
            const brandMatchup = component.bestMatchups.find(m => m.name === 'Brand');
            expect(brandMatchup).toBeUndefined();
        });
    });
});
