# LabSystem – Hillerød Hospital

Prototyp til intern opgavestyring for Klinisk Biokemisk Laboratorium, Region Hovedstaden.  
Bygget som semesterprojekt på **BA-BINTO1801U – Analyse og design af brugervenlige informationssystemer**, CBS 2026.

---

## Hvad er systemet?

Et browser-baseret system der erstatter den nuværende telefoniske koordinering mellem planlæggere og bioanalytikere.

**To brugerroller:**

| Rolle | Ansvar |
|---|---|
| **Planlægger** | Opretter og tildeler opgaver, sender akutkald, holder overblikket |
| **Prøvetager** | Ser tildelte opgaver, tager åbne opgaver, markerer dem færdige |

---

## Mappestruktur

```
lab-system/
│
├── index.html          ← Eneste HTML-fil (single-page app)
│
├── css/
│   ├── tokens.css      ← Design tokens, CSS-variabler, animationer
│   ├── components.css  ← Knapper, badges, modaler, toasts, topbar
│   ├── planner.css     ← Login-skærm + planlæggersiden
│   └── worker.css      ← Prøvetager-siden
│
├── data/
│   └── data.js         ← Mock-data: STAFF[], INITIAL_TASKS[], PLANNER_USERS[], WORKER_USERS[]
│                          (TODO: erstat med API-kald)
│
└── js/
    ├── app.js          ← Entry point: login, routing, live ur
    ├── ui.js           ← Delte UI-hjælpere: toast(), openModal(), closeModal()
    ├── planner.js      ← Al logik for planlæggersiden
    └── worker.js       ← Al logik for prøvetager-siden
```

---

## Kom i gang

Projektet kræver **ingen build-trin** og **ingen afhængigheder**.

```bash
# Klon dit repo
git clone https://github.com/DIT-REPO/lab-system.git
cd lab-system

# Åbn direkte i browser (Chrome / Edge / Firefox)
open index.html

# Eller start en lokal server (anbefalet for korrekt modul-opløsning)
npx serve .
# → http://localhost:3000
```

---

## Teknologier

| Teknologi | Brug |
|---|---|
| Vanilla HTML / CSS / JS | Ingen framework-afhængigheder |
| CSS Custom Properties | Designtokens og temahåndtering |
| Plus Jakarta Sans | Skrifttype (Google Fonts) |

---

## Næste skridt (til det rigtige system)

- [ ] Erstat `data/data.js` med en rigtig REST API (f.eks. `GET /api/tasks`)
- [ ] Tilføj rigtig autentifikation (SSO / MitID erhverv / AD)
- [ ] Realtidsopdateringer via WebSocket eller Server-Sent Events (SSE)
- [ ] Gem opgavestatus i en database (f.eks. PostgreSQL)
- [ ] Push-notifikationer til prøvetagere ved nye akutte opgaver
- [ ] Log og audit trail af alle handlinger

---

## Rapportreference

Prototype til: **Vertikal prototype** (think-aloud test med informanter)  
Caseopslag: [Copenhagen Health Innovation – Erstatning for telefonisk henvendelse](https://copenhagenhealthinnovation.dk/opslag/erstatning-for-telefonisk-henvendelse/)
