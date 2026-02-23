import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Champion } from '../../models/champion.model';
import { Game } from '../../models/game.model';

// Direct imports — no HttpClient, no fetch, fully synchronous for champion info
import championData from '../../../assets/champion_info_2.json';

// Import PapaParse and the raw CSV as text for synchronous parsing
import Papa from 'papaparse';

interface ChampionStats {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    pickRate: number;
    banRate: number;
    avgGameDuration: string;
    team1Picks: number;
    team2Picks: number;
}

@Component({
    selector: 'app-champion-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
    templateUrl: './champion-detail.component.html',
    styleUrl: './champion-detail.component.css',
})
export class ChampionDetailComponent implements OnInit {
    champion: Champion | null = null;
    stats: ChampionStats | null = null;
    loading = true;
    statsError = false;
    roleColors: Record<string, string> = {
        Assassin: '#e04040',
        Fighter: '#e07040',
        Mage: '#9060e0',
        Marksman: '#40a0e0',
        Support: '#40c070',
        Tank: '#6090c0',
    };
    roleIcons: Record<string, string> = {
        Assassin: 'flash_on',
        Fighter: 'fitness_center',
        Mage: 'auto_fix_high',
        Marksman: 'gps_fixed',
        Support: 'healing',
        Tank: 'shield',
    };

    // Champion ID→name lookup for CSV resolution
    private champMap = new Map<number, string>();

    constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
        const champRaw = (championData as any).data as Record<string, any>;
        for (const c of Object.values(champRaw)) {
            this.champMap.set(Number(c.id), c.name as string);
        }
    }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        // Load champion synchronously from JSON
        const championsRaw = (championData as any).data as Record<string, any>;
        const found = Object.values(championsRaw).find((c: any) => c.id === id);

        if (found) {
            this.champion = {
                id: found.id,
                name: found.name,
                key: found.key,
                title: found.title,
                tags: found.tags,
            };
        }

        // Load game stats via fetch with a 5-second timeout
        this.loadStats();
    }

    private loadStats(): void {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        fetch('/assets/games.csv', { signal: controller.signal })
            .then((res) => res.text())
            .then((csv) => {
                clearTimeout(timeoutId);
                const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
                const games = (result.data as any[]).map((row) => this.mapRow(row));

                if (this.champion) {
                    this.stats = this.computeStats(this.champion.name, games);
                }
                this.loading = false;
                this.cdr.detectChanges(); // Force Angular to detect changes (fetch runs outside zone)
            })
            .catch(() => {
                clearTimeout(timeoutId);
                this.statsError = true;
                this.loading = false;
                this.cdr.detectChanges();
            });
    }

    private resolveChamp(id: number): string {
        return this.champMap.get(id) ?? `#${id}`;
    }

    private mapRow(r: any): Game {
        const n = (key: string) => Number(r[key]) || 0;

        const buildTeam = (prefix: string) => {
            const champions: string[] = [];
            const summonerSpells: string[] = [];
            for (let i = 1; i <= 5; i++) {
                champions.push(this.resolveChamp(n(`${prefix}_champ${i}id`)));
                summonerSpells.push(`#${n(`${prefix}_champ${i}_sum1`)}`);
                summonerSpells.push(`#${n(`${prefix}_champ${i}_sum2`)}`);
            }
            const bans: string[] = [];
            for (let i = 1; i <= 5; i++) {
                const banId = n(`${prefix}_ban${i}`);
                bans.push(banId > 0 ? this.resolveChamp(banId) : '—');
            }
            return { champions, summonerSpells, towerKills: 0, inhibitorKills: 0, baronKills: 0, dragonKills: 0, riftHeraldKills: 0, bans };
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

    private computeStats(name: string, games: Game[]): ChampionStats {
        let gamesPlayed = 0;
        let wins = 0;
        let losses = 0;
        let totalDuration = 0;
        let team1Picks = 0;
        let team2Picks = 0;
        let banCount = 0;

        for (const game of games) {
            const inTeam1 = game.team1.champions.includes(name);
            const inTeam2 = game.team2.champions.includes(name);
            const banned = game.team1.bans.includes(name) || game.team2.bans.includes(name);

            if (banned) banCount++;

            if (inTeam1 || inTeam2) {
                gamesPlayed++;
                totalDuration += game.gameDuration;

                if (inTeam1) {
                    team1Picks++;
                    if (game.winner === 1) wins++;
                    else losses++;
                }
                if (inTeam2) {
                    team2Picks++;
                    if (game.winner === 2) wins++;
                    else losses++;
                }
            }
        }

        const avgSec = gamesPlayed > 0 ? totalDuration / gamesPlayed : 0;
        const m = Math.floor(avgSec / 60);
        const s = Math.round(avgSec % 60);

        return {
            gamesPlayed,
            wins,
            losses,
            winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 1000) / 10 : 0,
            pickRate: games.length > 0 ? Math.round((gamesPlayed / games.length) * 1000) / 10 : 0,
            banRate: games.length > 0 ? Math.round((banCount / games.length) * 1000) / 10 : 0,
            avgGameDuration: `${m}:${s.toString().padStart(2, '0')}`,
            team1Picks,
            team2Picks,
        };
    }
}
