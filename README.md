<h1 align="center">
  🎮 LOL Champions
</h1>

<p align="center">
  <strong>Tableau de bord Angular pour explorer les champions et les parties classées de League of Legends</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-21-dd0031?logo=angular" alt="Angular 21">
  <img src="https://img.shields.io/badge/Material-21-3f51b5?logo=googlechrome" alt="Material Design">
  <img src="https://img.shields.io/badge/AG--Grid-35-0084e7" alt="AG-Grid 35">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT">
</p>

---

## 📸 Aperçu

| Champions | Page Détail | Historique des Parties |
|:---------:|:-----------:|:----------------------:|
| Liste complète avec recherche, tri et filtres | Stats calculées à partir de 10 000+ parties | Dashboard avec win rates et stat cards |

---

## ✨ Fonctionnalités

### 📋 Liste des Champions
- Grille **AG-Grid** avec **tri**, **filtre par texte** et **filtre par rôle**
- Recherche en temps réel (Reactive Form avec debounce)
- **CRUD complet** : Ajouter, modifier et supprimer des champions via un dialog Material
- Badges de rôle colorés (Assassin, Fighter, Mage, Marksman, Support, Tank)
- Clic sur un nom → navigation vers la **page détail**

### 🏆 Page Détail Champion *(Bonus)*
- **Hero section** : avatar, nom, titre, badges de rôle avec icônes Material
- **Statistiques Ranked** calculées en temps réel à partir du dataset :
  - Parties jouées, Win Rate, Pick Rate, Ban Rate
  - Barre visuelle Victoires / Défaites
  - Répartition Côté Bleu vs Rouge
  - Durée moyenne des parties

### ⚡ Sorts d'Invocateur
- Liste AG-Grid des sorts d'invocateur
- Badges de niveau colorés (vert → orange → rouge selon le niveau requis)

### 📊 Historique des Parties
- **10 137 parties** chargées depuis un fichier CSV
- Dashboard avec **stat cards** : total games, win rate équipe 1 & 2, durée moyenne
- Grille détaillée : compositions d'équipes, bans, objectifs (Baron, Dragon, Herald, tours)
- Résolution automatique des IDs en noms de champions et sorts

### 🎨 Design
- Thème sombre **League of Legends** (bleu nuit + accents dorés `#c89b3c`)
- Effets **glassmorphism** (`backdrop-filter: blur`)
- **Animations d'entrée** : fade-in, slide-up avec décalages progressifs
- **Micro-interactions** : hover glow, scale, lift sur les cartes et boutons
- Scrollbar personnalisée
- Typographie **Cinzel** pour les titres, polices système pour le contenu

---

## 🛠 Stack Technique

| Technologie | Version | Rôle |
|------------|---------|------|
| **Angular** | 21 | Framework principal |
| **Angular Material** | 21 | Composants UI (toolbar, tabs, dialogs, forms, icons) |
| **AG-Grid** | 35 | Grilles de données haute performance |
| **Reactive Forms** | — | Formulaires typés (pas de template-driven) |
| **In-Memory Web API** | 0.21 | Simulation de serveur REST (pas de backend) |
| **PapaParse** | 5.5 | Parsing du CSV côté client |
| **RxJS** | 7.8 | Programmation réactive (debounce, observables) |
| **TypeScript** | 5.9 | Typage statique |

---

## 📁 Architecture du Projet

```
src/
├── assets/
│   ├── champion_info_2.json      # Données des 140+ champions
│   ├── summoner_spell_info.json  # Données des sorts d'invocateur
│   └── games.csv                 # 10 137 parties classées (Kaggle)
├── app/
│   ├── components/
│   │   ├── champion-list/        # Liste + CRUD des champions
│   │   ├── champion-detail/      # Page détail avec stats ranked
│   │   ├── champion-form-dialog/ # Dialog d'ajout/modification
│   │   ├── champion-actions/     # Cell renderer pour éditer/supprimer
│   │   ├── summoner-spell-list/  # Liste des sorts d'invocateur
│   │   └── game-list/            # Historique des parties + dashboard
│   ├── models/
│   │   ├── champion.model.ts     # Interface Champion
│   │   ├── summoner-spell.model.ts
│   │   └── game.model.ts         # Interfaces Game & GameTeam
│   ├── services/
│   │   ├── champion.service.ts   # CRUD via HttpClient + InMemoryWebAPI
│   │   ├── game.service.ts       # Parsing CSV + résolution des IDs
│   │   └── in-memory-data.ts     # Base de données simulée
│   ├── app.routes.ts             # Routing (5 routes)
│   ├── app.config.ts             # Configuration Angular
│   └── app.ts                    # Composant racine
├── styles.css                    # Styles globaux, animations, Material overrides
└── material-theme.scss           # Thème Material Design personnalisé
```

---

## 🚀 Installation & Lancement

### Prérequis

- **Node.js** 18+ 
- **npm** 9+

### Étapes

```bash
# Cloner le repo
git clone https://github.com/Guen0x/lol-champions-app.git
cd lol-champions-app

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
```

Ouvrir **http://localhost:4200** dans votre navigateur.

### Build de production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

---

## 📊 Dataset

Les données proviennent du dataset Kaggle **[League of Legends Ranked Games](https://www.kaggle.com/)** et comprennent :

- **`champion_info.json`** — 140+ champions avec nom, titre, clé et rôles
- **`summoner_spell_info.json`** — Sorts d'invocateur avec niveau requis
- **`games.csv`** — 10 137 parties classées avec :
  - Compositions des 2 équipes (5 champions chacune)
  - Sorts d'invocateur utilisés
  - Bans (5 par équipe)
  - Objectifs (Baron, Dragon, Herald, tours, inhibiteurs)
  - Résultat (gagnant, first blood, first tower, etc.)
  - Durée de la partie

---

## 🔑 Points Techniques Notables

### Simulation d'API REST
L'application utilise `angular-in-memory-web-api` pour intercepter les appels `HttpClient` et simuler un serveur REST complet (GET, POST, PUT, DELETE) sans aucun backend.

### Reactive Forms
Le formulaire d'ajout/modification de champion utilise `FormBuilder` avec des `Validators` (required, minLength). Aucun template-driven form n'est utilisé.

### Chargement du CSV
Le `GameService` utilise `fetch()` natif (pour contourner l'intercepteur InMemoryWebAPI) et **PapaParse** pour parser les 10 000+ lignes du CSV côté client. Les IDs numériques des champions et sorts sont automatiquement résolus en noms lisibles.

### AG-Grid Custom Theme
Chaque grille utilise `themeQuartz.withParams()` pour appliquer un thème sombre cohérent avec l'identité visuelle de l'application (arrière-plans sombres, texte doré, hover subtil).

---

## 📜 Licence

MIT — Libre d'utilisation, modification et distribution.
