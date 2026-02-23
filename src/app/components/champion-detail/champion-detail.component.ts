import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Champion } from '../../models/champion.model';
import { GameService } from '../../services/game.service';
import { Game } from '../../models/game.model';

// Import champion JSON directly (same source as InMemoryData)
import championData from '../../../assets/champion_info_2.json';

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
    loadingChampion = true;
    loadingStats = true;
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

    constructor(
        private route: ActivatedRoute,
        private gameService: GameService
    ) { }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        // Load champion directly from JSON (bypasses in-memory web API entirely)
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
            this.loadingChampion = false;
            this.loadStats(this.champion.name);
        } else {
            this.loadingChampion = false;
            this.loadingStats = false;
        }
    }

    private loadStats(championName: string): void {
        this.gameService.getGames().subscribe({
            next: (games) => {
                this.stats = this.computeStats(championName, games);
                this.loadingStats = false;
            },
            error: () => {
                this.loadingStats = false;
            },
        });
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
            const banned =
                game.team1.bans.includes(name) || game.team2.bans.includes(name);

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
