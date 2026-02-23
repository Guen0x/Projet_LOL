import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AgGridAngular } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    GridApi,
    GridReadyEvent,
    ModuleRegistry,
    themeQuartz,
} from 'ag-grid-community';

// Register AG-Grid community modules globally (required in AG-Grid 32+)
ModuleRegistry.registerModules([AllCommunityModule]);

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

import { Champion } from '../../models/champion.model';
import { ChampionService } from '../../services/champion.service';
import {
    ChampionFormDialogComponent,
    DialogData,
} from '../champion-form-dialog/champion-form-dialog.component';
import { ChampionActionsComponent } from '../champion-actions/champion-actions.component';

@Component({
    selector: 'app-champion-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AgGridAngular,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
    ],
    templateUrl: './champion-list.component.html',
    styleUrl: './champion-list.component.css',
})
export class ChampionListComponent implements OnInit, OnDestroy {
    champions: Champion[] = [];
    loading = true;
    private gridApi!: GridApi;
    private subs = new Subscription();

    searchForm: FormGroup;

    /** AG-Grid 32+ JavaScript-based dark theme */
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
            flex: 1,
            sortable: true,
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => {
                if (!params.data) return '';
                return `<span style="
                    font-weight:600;
                    color:#e8d5a3;
                    cursor:pointer;
                    transition:color .15s ease;
                    border-bottom:1px dashed rgba(200,155,60,0.3);
                    padding-bottom:1px;
                " onmouseover="this.style.color='#c89b3c'" onmouseout="this.style.color='#e8d5a3'">${params.value}</span>`;
            },
            onCellClicked: (params: any) => {
                if (params.data) {
                    this.router.navigate(['/champions', params.data.id]);
                }
            },
        },
        {
            field: 'title',
            headerName: 'Titre',
            flex: 1.5,
            sortable: true,
            filter: 'agTextColumnFilter',
            cellStyle: { fontStyle: 'italic', color: '#9aabb8' },
        },
        {
            field: 'tags',
            headerName: 'Rôles',
            flex: 1,
            sortable: true,
            filter: 'agTextColumnFilter',
            valueGetter: (params: any) => {
                if (!params.data?.tags || !Array.isArray(params.data.tags)) return '';
                return params.data.tags.join(', ');
            },
            cellRenderer: this.tagsCellRenderer,
        },
        {
            headerName: 'Actions',
            width: 110,
            sortable: false,
            filter: false,
            cellRenderer: ChampionActionsComponent,
            cellRendererParams: {
                onEdit: (champion: Champion) => this.openEditDialog(champion),
                onDelete: (champion: Champion) => this.deleteChampion(champion),
            },
        },
    ];

    defaultColDef: ColDef = {
        resizable: true,
    };

    constructor(
        private championService: ChampionService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.searchForm = this.fb.group({ search: [''] });
    }

    ngOnInit(): void {
        this.loadChampions();

        const searchSub = this.searchForm
            .get('search')!
            .valueChanges.pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((value: string) => {
                if (this.gridApi) {
                    this.gridApi.setGridOption('quickFilterText', value ?? '');
                }
            });
        this.subs.add(searchSub);
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    onGridReady(event: GridReadyEvent): void {
        this.gridApi = event.api;
    }

    loadChampions(): void {
        this.loading = true;
        const sub = this.championService.getChampions().subscribe({
            next: (data) => {
                this.champions = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.snackBar.open('Erreur lors du chargement des champions', 'Fermer', {
                    duration: 3000,
                });
            },
        });
        this.subs.add(sub);
    }

    openAddDialog(): void {
        const dialogRef = this.dialog.open(ChampionFormDialogComponent, {
            data: {} as DialogData,
            panelClass: 'lol-dialog',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (!result) return;
            const newChampion: Champion = {
                id: 0,
                key: result.name.replace(/\s+/g, ''),
                ...result,
            };
            const sub = this.championService.addChampion(newChampion).subscribe({
                next: (added) => {
                    this.champions = [...this.champions, added];
                    this.snackBar.open(`${added.name} ajouté avec succès !`, '✓', {
                        duration: 3000,
                        panelClass: ['success-snack'],
                    });
                },
            });
            this.subs.add(sub);
        });
    }

    openEditDialog(champion: Champion): void {
        const dialogRef = this.dialog.open(ChampionFormDialogComponent, {
            data: { champion } as DialogData,
            panelClass: 'lol-dialog',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (!result) return;
            const updated: Champion = { ...champion, ...result };
            const sub = this.championService.updateChampion(updated).subscribe({
                next: () => {
                    this.champions = this.champions.map((c) => (c.id === updated.id ? updated : c));
                    this.snackBar.open(`${updated.name} modifié avec succès !`, '✓', {
                        duration: 3000,
                        panelClass: ['success-snack'],
                    });
                },
            });
            this.subs.add(sub);
        });
    }

    deleteChampion(champion: Champion): void {
        const sub = this.championService.deleteChampion(champion.id).subscribe({
            next: () => {
                this.champions = this.champions.filter((c) => c.id !== champion.id);
                this.snackBar.open(`${champion.name} supprimé`, 'Annuler', {
                    duration: 3500,
                    panelClass: ['delete-snack'],
                });
            },
        });
        this.subs.add(sub);
    }

    private tagsCellRenderer(params: any): string {
        const tags = params.data?.tags;
        if (!tags || !Array.isArray(tags)) return '';
        const colorMap: Record<string, string> = {
            Assassin: '#e04040',
            Fighter: '#e07040',
            Mage: '#9060e0',
            Marksman: '#40a0e0',
            Support: '#40c070',
            Tank: '#6090c0',
        };
        return tags
            .map(
                (tag: string) =>
                    `<span style="
            display:inline-block;
            background:${colorMap[tag] ?? '#555'}22;
            color:${colorMap[tag] ?? '#aaa'};
            border:1px solid ${colorMap[tag] ?? '#555'}66;
            border-radius:12px;
            padding:1px 10px;
            font-size:11px;
            font-weight:600;
            margin-right:4px;
            letter-spacing:0.04em
          ">${tag}</span>`
            )
            .join('');
    }
}
