import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgGridAngular } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    GridApi,
    GridReadyEvent,
    ModuleRegistry,
    themeQuartz,
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Game } from '../../models/game.model';
import { GameService } from '../../services/game.service';

@Component({
    selector: 'app-game-list',
    standalone: true,
    imports: [CommonModule, AgGridAngular, MatProgressSpinnerModule],
    templateUrl: './game-list.component.html',
    styleUrl: './game-list.component.css',
})
export class GameListComponent implements OnInit {
    games: Game[] = [];
    loading = true;
    private gridApi!: GridApi;

    // Dashboard stats
    totalGames = 0;
    team1WinRate = 0;
    team2WinRate = 0;
    avgDuration = '';

    theme = themeQuartz.withParams({
        backgroundColor: '#0d1526',
        foregroundColor: '#c4b998',
        headerBackgroundColor: '#071020',
        headerTextColor: '#c89b3c',
        headerFontWeight: 700,
        rowHoverColor: 'rgba(200,155,60,0.06)',
        selectedRowBackgroundColor: 'rgba(200,155,60,0.12)',
        borderColor: '#1e3050',
        columnBorder: true,
        accentColor: '#c89b3c',
        fontSize: 13,
        rowBorder: true,
    });

    columnDefs: ColDef[] = [
        {
            field: 'gameId',
            headerName: 'ID',
            width: 130,
            sortable: true,
            filter: 'agNumberColumnFilter',
            cellStyle: { color: '#7a8ba6', fontWeight: '600', fontFamily: 'monospace', fontSize: '11px' },
        },
        {
            headerName: 'Date',
            width: 165,
            sortable: true,
            valueGetter: (p: any) => p.data?.creationTime,
            valueFormatter: (p: any) => {
                if (!p.value) return '';
                const d = new Date(p.value);
                return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                    + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            },
            cellStyle: { color: '#9aabb8', fontSize: '12px' },
        },
        {
            headerName: 'Durée',
            width: 90,
            sortable: true,
            valueGetter: (p: any) => p.data?.gameDuration,
            valueFormatter: (p: any) => {
                if (!p.value) return '';
                const m = Math.floor(p.value / 60);
                const s = p.value % 60;
                return `${m}:${s.toString().padStart(2, '0')}`;
            },
            cellStyle: { color: '#c4b998', fontWeight: '600' },
        },
        {
            field: 'winner',
            headerName: 'Victoire',
            width: 100,
            sortable: true,
            filter: 'agNumberColumnFilter',
            cellRenderer: (p: any) => {
                if (!p.value) return '';
                const color = p.value === 1 ? '#4090e0' : '#e04040';
                const label = p.value === 1 ? 'Bleu' : 'Rouge';
                return `<span style="
                    display:inline-block;
                    background:${color}22;
                    color:${color};
                    border:1px solid ${color}66;
                    border-radius:12px;
                    padding:1px 12px;
                    font-size:12px;
                    font-weight:700;
                ">${label}</span>`;
            },
        },
        {
            headerName: 'Équipe Bleue',
            field: 'team1',
            flex: 1,
            minWidth: 250,
            sortable: false,
            cellRenderer: (p: any) => {
                if (!p.value) return '';
                return this.renderTeamChamps(p.value.champions, '#4090e0');
            },
        },
        {
            headerName: 'Équipe Rouge',
            field: 'team2',
            flex: 1,
            minWidth: 250,
            sortable: false,
            cellRenderer: (p: any) => {
                if (!p.value) return '';
                return this.renderTeamChamps(p.value.champions, '#e04040');
            },
        },
        {
            headerName: '🏰',
            width: 55,
            valueGetter: (p: any) => p.data?.team1?.towerKills,
            cellStyle: { color: '#4090e0', fontWeight: '700', textAlign: 'center' },
        },
        {
            headerName: '🐉',
            width: 55,
            valueGetter: (p: any) => p.data?.team1?.dragonKills,
            cellStyle: { color: '#4090e0', fontWeight: '700', textAlign: 'center' },
        },
        {
            headerName: '🏰',
            width: 55,
            valueGetter: (p: any) => p.data?.team2?.towerKills,
            cellStyle: { color: '#e04040', fontWeight: '700', textAlign: 'center' },
        },
        {
            headerName: '🐉',
            width: 55,
            valueGetter: (p: any) => p.data?.team2?.dragonKills,
            cellStyle: { color: '#e04040', fontWeight: '700', textAlign: 'center' },
        },
    ];

    defaultColDef: ColDef = {
        resizable: true,
    };

    constructor(
        private gameService: GameService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadGames();
    }

    onGridReady(event: GridReadyEvent): void {
        this.gridApi = event.api;
    }

    loadGames(): void {
        this.loading = true;
        this.gameService.getGames().subscribe({
            next: (data) => {
                this.games = data;
                this.computeStats(data);
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.snackBar.open('Erreur lors du chargement des parties', 'Fermer', {
                    duration: 3000,
                });
            },
        });
    }

    private computeStats(games: Game[]): void {
        this.totalGames = games.length;
        const t1Wins = games.filter((g) => g.winner === 1).length;
        this.team1WinRate = Math.round((t1Wins / games.length) * 100);
        this.team2WinRate = 100 - this.team1WinRate;
        const avgSec = games.reduce((sum, g) => sum + g.gameDuration, 0) / games.length;
        const m = Math.floor(avgSec / 60);
        const s = Math.round(avgSec % 60);
        this.avgDuration = `${m}:${s.toString().padStart(2, '0')}`;
    }

    private renderTeamChamps(champions: string[], color: string): string {
        return champions
            .map(
                (name) =>
                    `<span style="
                        display:inline-block;
                        background:${color}15;
                        color:${color};
                        border:1px solid ${color}44;
                        border-radius:10px;
                        padding:0 6px;
                        font-size:10px;
                        font-weight:600;
                        margin-right:3px;
                        letter-spacing:0.02em;
                        white-space:nowrap;
                    ">${name}</span>`
            )
            .join('');
    }
}
