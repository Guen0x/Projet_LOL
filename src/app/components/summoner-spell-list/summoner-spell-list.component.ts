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

import { SummonerSpell } from '../../models/summoner-spell.model';
import { ChampionService } from '../../services/champion.service';

@Component({
    selector: 'app-summoner-spell-list',
    standalone: true,
    imports: [
        CommonModule,
        AgGridAngular,
        MatProgressSpinnerModule,
    ],
    templateUrl: './summoner-spell-list.component.html',
    styleUrl: './summoner-spell-list.component.css',
})
export class SummonerSpellListComponent implements OnInit {
    spells: SummonerSpell[] = [];
    loading = true;
    private gridApi!: GridApi;

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
        fontSize: 14,
        rowBorder: true,
    });

    columnDefs: ColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
            sortable: true,
            filter: 'agNumberColumnFilter',
            cellStyle: { color: '#7a8ba6', fontWeight: '600' },
        },
        {
            field: 'name',
            headerName: 'Nom',
            width: 200,
            sortable: true,
            filter: 'agTextColumnFilter',
            cellStyle: { fontWeight: '600', color: '#e8d5a3' },
        },
        {
            field: 'key',
            headerName: 'Clé',
            width: 220,
            sortable: true,
            filter: 'agTextColumnFilter',
            cellStyle: { color: '#9aabb8', fontFamily: 'monospace' },
        },
        {
            field: 'summonerLevel',
            headerName: 'Niveau requis',
            width: 140,
            sortable: true,
            filter: 'agNumberColumnFilter',
            cellRenderer: this.levelCellRenderer,
        },
        {
            field: 'description',
            headerName: 'Description',
            flex: 1,
            sortable: false,
            filter: 'agTextColumnFilter',
            cellStyle: { color: '#9aabb8', fontSize: '12px' },
            autoHeight: true,
            wrapText: true,
        },
    ];

    defaultColDef: ColDef = {
        resizable: true,
    };

    constructor(
        private championService: ChampionService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadSpells();
    }

    onGridReady(event: GridReadyEvent): void {
        this.gridApi = event.api;
    }

    loadSpells(): void {
        this.loading = true;
        this.championService.getSummonerSpells().subscribe({
            next: (data) => {
                this.spells = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.snackBar.open('Erreur lors du chargement des sorts d\'invocateur', 'Fermer', {
                    duration: 3000,
                });
            },
        });
    }

    private levelCellRenderer(params: any): string {
        if (params.value == null) return '';
        const level = params.value;
        const color = level <= 1 ? '#40c070' : level <= 6 ? '#e0a040' : '#e04040';
        return `<span style="
            display:inline-block;
            background:${color}22;
            color:${color};
            border:1px solid ${color}66;
            border-radius:12px;
            padding:1px 12px;
            font-size:12px;
            font-weight:700;
            letter-spacing:0.04em;
        ">Lvl ${level}</span>`;
    }
}
