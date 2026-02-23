import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { Champion } from '../../models/champion.model';

export const ALL_TAGS = ['Assassin', 'Fighter', 'Mage', 'Marksman', 'Support', 'Tank'];

export interface DialogData {
    champion?: Champion;
}

@Component({
    selector: 'app-champion-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatChipsModule,
    ],
    templateUrl: './champion-form-dialog.component.html',
    styleUrl: './champion-form-dialog.component.css',
})
export class ChampionFormDialogComponent {
    form: FormGroup;
    isEditMode: boolean;
    allTags = ALL_TAGS;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<ChampionFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.isEditMode = !!data?.champion;
        this.form = this.fb.group({
            name: [data?.champion?.name ?? '', [Validators.required, Validators.minLength(2)]],
            title: [data?.champion?.title ?? '', [Validators.required, Validators.minLength(3)]],
            tags: [data?.champion?.tags ?? [], [Validators.required]],
        });
    }

    get nameError(): string {
        const ctrl = this.form.get('name')!;
        if (ctrl.hasError('required')) return 'Le nom est obligatoire';
        if (ctrl.hasError('minlength')) return 'Minimum 2 caractères';
        return '';
    }

    get titleError(): string {
        const ctrl = this.form.get('title')!;
        if (ctrl.hasError('required')) return 'Le titre est obligatoire';
        if (ctrl.hasError('minlength')) return 'Minimum 3 caractères';
        return '';
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const result: Partial<Champion> = {
            ...this.form.value,
            ...(this.isEditMode ? { id: this.data.champion!.id, key: this.data.champion!.key } : {}),
        };
        this.dialogRef.close(result);
    }

    cancel(): void {
        this.dialogRef.close();
    }
}
