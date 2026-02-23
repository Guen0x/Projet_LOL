import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Champion } from '../models/champion.model';
import { SummonerSpell } from '../models/summoner-spell.model';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
    providedIn: 'root',
})
export class ChampionService {
    private championsUrl = 'api/champions';

    constructor(private http: HttpClient) { }

    getChampions(): Observable<Champion[]> {
        return this.http.get<Champion[]>(this.championsUrl);
    }

    getChampion(id: number): Observable<Champion> {
        return this.http.get<Champion>(`${this.championsUrl}/${id}`);
    }

    addChampion(champion: Champion): Observable<Champion> {
        return this.http.post<Champion>(this.championsUrl, champion, httpOptions);
    }

    updateChampion(champion: Champion): Observable<Champion> {
        return this.http.put<Champion>(this.championsUrl, champion, httpOptions);
    }

    deleteChampion(id: number): Observable<void> {
        return this.http.delete<void>(`${this.championsUrl}/${id}`, httpOptions);
    }

    getSummonerSpells(): Observable<SummonerSpell[]> {
        return this.http.get<SummonerSpell[]>('api/summonerSpells');
    }
}
