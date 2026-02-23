import { Routes } from '@angular/router';
import { ChampionListComponent } from './components/champion-list/champion-list.component';
import { ChampionDetailComponent } from './components/champion-detail/champion-detail.component';
import { SummonerSpellListComponent } from './components/summoner-spell-list/summoner-spell-list.component';
import { GameListComponent } from './components/game-list/game-list.component';

export const routes: Routes = [
    { path: '', redirectTo: 'champions', pathMatch: 'full' },
    { path: 'champions', component: ChampionListComponent },
    { path: 'champions/:id', component: ChampionDetailComponent },
    { path: 'summoner-spells', component: SummonerSpellListComponent },
    { path: 'games', component: GameListComponent },
    { path: '**', redirectTo: 'champions' },
];
