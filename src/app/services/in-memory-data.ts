import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Champion } from '../models/champion.model';
import { SummonerSpell } from '../models/summoner-spell.model';

import championData from '../../assets/champion_info_2.json';
import summonerSpellData from '../../assets/summoner_spell_info.json';

@Injectable({
  providedIn: 'root',
})
export class InMemoryData implements InMemoryDbService {
  createDb() {
    const championsRaw = (championData as any).data as Record<string, any>;
    const champions: Champion[] = Object.values(championsRaw)
      .filter((c: any) => Array.isArray(c.tags) && c.id !== -1)
      .map((c: any) => ({
        id: c.id as number,
        name: c.name as string,
        key: c.key as string,
        title: c.title as string,
        tags: c.tags as string[],
      }));

    const spellsRaw = (summonerSpellData as any).data as Record<string, any>;
    const summonerSpells: SummonerSpell[] = Object.values(spellsRaw).map((s: any) => ({
      id: s.id as number,
      name: s.name as string,
      key: s.key as string,
      description: s.description as string,
      summonerLevel: s.summonerLevel as number,
    }));

    return { champions, summonerSpells };
  }

  genId(champions: Champion[]): number {
    return champions.length > 0 ? Math.max(...champions.map((c) => c.id)) + 1 : 1;
  }
}