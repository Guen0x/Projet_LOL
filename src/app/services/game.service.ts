import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import Papa from 'papaparse';
import { Game, GameTeam } from '../models/game.model';

import championData from '../../assets/champion_info_2.json';
import summonerSpellData from '../../assets/summoner_spell_info.json';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private champMap: Map<number, string>;
    private spellMap: Map<number, string>;

    constructor() {
        // Build ID → name lookup maps
        const champRaw = (championData as any).data as Record<string, any>;
        this.champMap = new Map<number, string>();
        for (const c of Object.values(champRaw)) {
            this.champMap.set(Number(c.id), c.name as string);
        }

        const spellRaw = (summonerSpellData as any).data as Record<string, any>;
        this.spellMap = new Map<number, string>();
        for (const s of Object.values(spellRaw)) {
            this.spellMap.set(Number(s.id), s.name as string);
        }
    }

    getGames(): Observable<Game[]> {
        // Use fetch() instead of HttpClient to bypass the InMemoryWebApi interceptor
        return from(
            fetch('/assets/games.csv')
                .then((res) => res.text())
                .then((csv) => this.parseCsv(csv))
        );
    }

    private parseCsv(csv: string): Game[] {
        const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
        return (result.data as any[]).map((row) => this.mapRow(row));
    }

    private resolveChamp(id: number): string {
        return this.champMap.get(id) ?? `#${id}`;
    }

    private resolveSpell(id: number): string {
        return this.spellMap.get(id) ?? `#${id}`;
    }

    private mapRow(r: any): Game {
        const n = (key: string) => Number(r[key]) || 0;

        const buildTeam = (prefix: string): GameTeam => {
            const champions: string[] = [];
            const summonerSpells: string[] = [];
            for (let i = 1; i <= 5; i++) {
                champions.push(this.resolveChamp(n(`${prefix}_champ${i}id`)));
                summonerSpells.push(this.resolveSpell(n(`${prefix}_champ${i}_sum1`)));
                summonerSpells.push(this.resolveSpell(n(`${prefix}_champ${i}_sum2`)));
            }
            const bans: string[] = [];
            for (let i = 1; i <= 5; i++) {
                const banId = n(`${prefix}_ban${i}`);
                bans.push(banId > 0 ? this.resolveChamp(banId) : '—');
            }
            return {
                champions,
                summonerSpells,
                towerKills: n(`${prefix}_towerKills`),
                inhibitorKills: n(`${prefix}_inhibitorKills`),
                baronKills: n(`${prefix}_baronKills`),
                dragonKills: n(`${prefix}_dragonKills`),
                riftHeraldKills: n(`${prefix}_riftHeraldKills`),
                bans,
            };
        };

        return {
            gameId: n('gameId'),
            creationTime: n('creationTime'),
            gameDuration: n('gameDuration'),
            seasonId: n('seasonId'),
            winner: n('winner'),
            firstBlood: n('firstBlood'),
            firstTower: n('firstTower'),
            firstInhibitor: n('firstInhibitor'),
            firstBaron: n('firstBaron'),
            firstDragon: n('firstDragon'),
            firstRiftHerald: n('firstRiftHerald'),
            team1: buildTeam('t1'),
            team2: buildTeam('t2'),
        };
    }
}
