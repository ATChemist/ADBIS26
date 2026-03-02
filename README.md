# Hospital Koordinationssystem Prototype

## Setup

```bash
npm install
npm run dev
```

Build produktion:

```bash
npm run build
npm run preview
```

## Demo flows

- Skift mellem `Medarbejder` og `Planlægger` via tabs i toppen.
- Brug `System status` til at sætte app i `Offline` og opret handlinger (start/færdig/hjælp/tildeling).
- Gå tilbage til `Online` for at se køen blive synkroniseret automatisk.
- Åbn `Demo controls` og skift travlhedsprofil (`Mandag`, `Onsdag`, `Fredag`) eller juster opgavemængde.
- Trigger `Akut spike` for at indsætte kritiske opgaver.
- I planlægger-view: klik en opgave i kanban for manuel tildeling/omfordeling/annullering.
- Hvis opgaver står i `Ikke startet` over 15 min, vises banner med `Auto-tildel nu`.

## Keyboard shortcuts

- `g`: toggler aktivt view mellem Medarbejder og Planlægger.
