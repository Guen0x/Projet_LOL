import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ActionCellParams extends ICellRendererParams {
    onEdit: (data: any) => void;
    onDelete: (data: any) => void;
}

@Component({
    selector: 'app-champion-actions',
    standalone: true,
    imports: [MatIconButton, MatIconModule, MatTooltipModule],
    template: `
    <div class="actions-cell">
      <button mat-icon-button matTooltip="Modifier" class="edit-btn" (click)="onEdit()">
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button matTooltip="Supprimer" class="delete-btn" (click)="onDelete()">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
  `,
    styles: [
        `
      .actions-cell {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 100%;
      }
      .edit-btn {
        color: #5b9bd5;
      }
      .delete-btn {
        color: #e04040;
      }
    `,
    ],
})
export class ChampionActionsComponent implements ICellRendererAngularComp {
    private params!: ActionCellParams;

    agInit(params: ActionCellParams): void {
        this.params = params;
    }

    refresh(): boolean {
        return false;
    }

    onEdit(): void {
        this.params.onEdit(this.params.data);
    }

    onDelete(): void {
        this.params.onDelete(this.params.data);
    }
}
