export interface GameTeam {
    champions: string[];       // Resolved champion names
    summonerSpells: string[];  // Resolved summoner spell names (2 per champ, 10 total)
    towerKills: number;
    inhibitorKills: number;
    baronKills: number;
    dragonKills: number;
    riftHeraldKills: number;
    bans: string[];            // Resolved champion names for bans
}

export interface Game {
    gameId: number;
    creationTime: number;
    gameDuration: number;
    seasonId: number;
    winner: number;           // 1 = Team 1 wins, 2 = Team 2 wins
    firstBlood: number;
    firstTower: number;
    firstInhibitor: number;
    firstBaron: number;
    firstDragon: number;
    firstRiftHerald: number;
    team1: GameTeam;
    team2: GameTeam;
}
