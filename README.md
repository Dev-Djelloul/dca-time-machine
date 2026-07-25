# ⏳ DCA Time Machine

> **Simulateur DCA vs Lump Sum crypto, avec verdict sarcastique partageable**
> Un projet [Digital Blue Skye](https://github.com/Dev-Djelloul) — remonte le temps, investis façon DCA (Dollar-Cost Averaging), et découvre si t'aurais dû tout miser d'un coup à la place.

**🔗 Démo en ligne : [dca-timemachine.netlify.app](https://dca-timemachine.netlify.app/)**

---

## ✨ Ce que fait l'app

- **Simulation DCA vs Lump Sum** — choisis un montant mensuel et une date de départ, l'app calcule combien tu aurais accumulé en investissant petit à petit (DCA) vs en misant tout le premier mois (lump sum), sur Bitcoin, Ethereum ou Solana.
- **Animation "remontée dans le temps"** — le graphique se trace mois par mois façon course entre les deux stratégies.
- **Reçu sarcastique** — à la fin, un ticket de caisse façon terminal imprime un verdict chiffré et une pointe d'humour, comparé en cafés ou en pourcentage de Tesla Model 3.
- **Mode comparaison** — oppose 2 ou 3 cryptos entre elles (BTC / ETH / SOL) sur la même stratégie.
- **Actif de référence** — superpose un placement "classique" (S&P 500) pour remettre le gain crypto en perspective.
- **Mode cash différé** — simule le coût (ou le bénéfice) d'avoir attendu N mois avant d'investir, au lieu de foncer tout de suite.
- **Heatmap de volatilité** — petites barres en fond de graphique qui visualisent l'ampleur des variations mensuelles traversées.
- **Mode défi** — parie si le DCA va battre le lump sum *avant* de lancer la simulation ; ton score est sauvegardé localement entre les sessions.
- **Rappel de versement** — bannière qui indique si aujourd'hui est ton jour de versement du mois, avec le prix crypto en direct et ce que ton montant t'achèterait maintenant.
- **Scénarios "et si j'arrêtais aujourd'hui"** — projette ta position actuelle à ±30 %/+50 % à partir du prix live, pour explorer (pas prédire) différentes sorties.
- **Export image** — télécharge le reçu en PNG, ou une version "story" verticale (9:16) prête pour Instagram/Snapchat.
- **Identité visuelle propre** — logo dédié (favicon + header) et watermark discret sur les images exportées.
- **Données live + fallback** — tente un appel à l'API publique CoinGecko pour des prix réels, et bascule automatiquement sur un jeu de données local si l'API est indisponible (rate limit, réseau, etc.).

⚠️ **Avertissement** : cet outil est ludique et pédagogique. Les données de prix (surtout avant 2020 et pour le S&P 500) sont approximatives/illustratives. Ce n'est en aucun cas un conseil en investissement.

---

## 🛠️ Stack technique

- **React 18** + **Vite** (build ultra-rapide, zéro config lourde)
- **Recharts** pour les graphiques (courbes + barres de volatilité)
- **Canvas API native** pour l'export d'images et le watermark (pas de dépendance externe type html2canvas)
- **localStorage** pour la persistance des réglages et du score du mode défi
- **API CoinGecko** (`/simple/price` et `/coins/{id}/market_chart/range`) pour les données de prix en direct

Aucune dépendance backend : c'est une application 100 % front-end, déployable sur n'importe quel hébergeur statique (Netlify, Vercel, GitHub Pages...).

---

## 📦 Installation & lancement en local

### Prérequis
- [Node.js](https://nodejs.org/) v18 ou supérieur
- npm (fourni avec Node.js)

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/Dev-Djelloul/dca-time-machine.git
cd dca-time-machine

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

L'app sera accessible sur **http://localhost:5173** (ou le port indiqué dans le terminal).

### Build de production

```bash
npm run build     # génère le dossier dist/
npm run preview   # prévisualise le build en local
```

---

## 🧭 Comment naviguer dans l'app

1. **Choisis un actif** (Bitcoin / Ethereum / Solana) ou active le **mode comparaison** pour en opposer 2 ou 3.
2. **Règle le montant mensuel** (slider ou boutons de préréglage) et la **date de départ** (menu déroulant ou slider synchronisé).
3. *(Optionnel)* Coche **"Comparer à un placement classique"** pour voir le S&P 500 en superposition, ou règle le curseur **"cash différé"** pour simuler le coût d'attendre avant d'investir.
4. *(Optionnel)* Active le **mode défi** : tu devras parier si le DCA va battre le lump sum avant de pouvoir lancer la simulation.
5. Clique sur **"Lancer la simulation"** — regarde le graphique se tracer en direct.
6. À la fin, lis le **reçu** qui résume la simulation avec son verdict, puis :
   - **Copie le texte** pour le partager tel quel,
   - **Télécharge le reçu** en image PNG (avec watermark),
   - ou **télécharge la version story (9:16)** pour les réseaux sociaux.
7. Consulte la bannière en haut de page pour savoir si c'est ton **jour de versement** aujourd'hui, et le panneau **"et si j'arrêtais maintenant"** pour explorer des scénarios de sortie à partir du prix en direct.

Tous tes réglages (actif, montant, date, options activées) sont sauvegardés automatiquement dans ton navigateur et rechargés à ta prochaine visite.

---

## 🚀 Déploiement

L'app est déployée en continu sur Netlify : **[dca-timemachine.netlify.app](https://dca-timemachine.netlify.app/)** — chaque push sur `main` redéclenche un build et republie le site automatiquement.

### Reproduire le déploiement toi-même (Netlify)

```bash
npm run build
```
Puis glisse-dépose le dossier `dist/` sur [app.netlify.com/drop](https://app.netlify.com/drop), ou connecte le repo GitHub directement dans Netlify pour un déploiement continu.

**Build settings Netlify :**
- Build command : `npm run build`
- Publish directory : `dist`

### Vercel / GitHub Pages
Le projet étant un simple build Vite statique, il est compatible avec n'importe quel hébergeur de sites statiques suivant le même principe (build → dossier `dist/` → déploiement).

---

## 📂 Structure du projet

```
dca-time-machine/
├── index.html              # Point d'entrée HTML (favicon inclus)
├── package.json             # Dépendances et scripts npm
├── vite.config.js           # Configuration Vite
├── src/
│   ├── main.jsx              # Montage React
│   └── App.jsx                # Composant principal (toute la logique de l'app)
├── assets/
│   ├── icons/
│   │   └── dca-time-machine-icon.svg      # Icône seule (favicon, watermark)
│   └── logo/
│       └── dca-time-machine-lockup.svg    # Logo complet (header)
├── history/                 # Versions précédentes, conservées pour traçabilité
│   ├── v1-dca-vs-lumpsum-roast.jsx
│   ├── v2-live-data-eth-image-export.jsx
│   ├── v3-localstorage-compare-mode.jsx
│   ├── v4-solana-challenge-story-export.jsx
│   └── v5-reminders-exit-scenarios.jsx
└── README.md
```

---

## 📜 Historique des versions

| Version | Ajouts principaux |
| :--- | :--- |
| **v1** | Simulation DCA vs lump sum de base, animation, reçu sarcastique |
| **v2** | Données live CoinGecko + fallback, sélecteur BTC/ETH, export image (canvas natif) |
| **v3** | Persistance des réglages (localStorage), mode comparaison BTC vs ETH |
| **v4** | Ajout Solana (comparaison à 3 actifs), mode défi (prédiction + score), export format story 9:16 |
| **v5** | Bannière de rappel de versement (prix live), scénarios "et si j'arrêtais maintenant" |
| **v6** | Identité visuelle : logo dédié (favicon + header), watermark discret sur les exports |

---

## ⚖️ Licence

MIT — Digital Blue Skye. Libre d'utilisation, de modification et de redistribution.
