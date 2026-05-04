# Iteration 2 — Ændringsoversigt

Baseret på kooperativ evaluering med over-bioanalytikere og prøvetagere, Hillerød Hospital.

---

## Ændrede filer

| Fil | Ændring |
|-----|---------|
| `index.html` | Nye modaler (akut-worker, afdelingsfordeling, opgavedetalje), omskrevet tildelingsmodal med gruppe-tabs, klikbare stat-kort, patient-tæller på worker-siden, gruppetildeling-knap i header |
| `data/data.js` | Tilføjet `DEPT_PATIENTS` — hardcoded afdelingsfordeling (summerer til 197) |
| `js/planner.js` | Nedtælling (`updateStats`), `openDeptBreakdown()`, gruppetildeling (`setAssignMode`, `renderGroupTasks`, `confirmGroupAssign`, `openGroupAssignModal`), akut-broadcast til worker |
| `js/worker.js` | Akut-modal (`showWorkerAkutModal`, `acceptAkutKald`, `forwardAkutKald`), opgavedetalje (`openTaskDetail`), klikbare kort |
| `js/ui.js` | ESC-blokering for akut-modalen |
| `css/worker.css` | Akut fullscreen-modal styling, patient-tæller, forstørrede opgavekort |
| `css/planner.css` | Klikbare stat-kort, header-link, afdelingsfordeling, gruppetildelings-tabs og opgaveliste |
| `css/components.css` | Task detail grid |

## Nye komponenter / filer

Ingen nye filer — alt er tilføjet i eksisterende filer. Nye DOM-elementer:

- `#modal-akut-worker` — Fullscreen akut-modal (prøvetagerside)
- `#modal-dept-breakdown` — Afdelingsfordeling-modal (planlæggerside)
- `#modal-task-detail` — Opgavedetalje-zoom-modal (prøvetagerside)
- `#worker-patient-counter` — Patient-tæller banner (prøvetagerside)
- Gruppetildeling-tabs og -indhold i `#modal-assign`

## Sådan testes de fem ændringer

### Ændring 1 — Akut-modal (prøvetager)
1. Log ind som planlægger.
2. Klik "Akut kald" → vælg afdeling og besked → bekræft.
3. En rød fullscreen-modal dukker op (simulerer worker-visning).
4. Verificer: ESC og klik udenfor lukker IKKE modalen.
5. Klik "Acceptér opgave" → opgaven tildeles. Eller "Optaget — send videre" → console.log + toast.

### Ændring 2 — Klikbar patient-tæller
1. Log ind som planlægger.
2. Klik på "197"-stat-kortet (eller et af de andre stat-kort).
3. En modal viser afdelingsfordeling sorteret faldende.
4. Klik også på "197 patienter i dag ▾" i overskriften.

### Ændring 3 — Nedtællende tæller
1. Log ind som prøvetager → tag en opgave → markér færdig.
2. Patient-tallet på worker-siden tæller ned.
3. Log ind som planlægger (eller observer samme session) → stat-kortet og header opdateres.
4. Åbn afdelingsfordelingen mens du markerer en opgave færdig — tallene opdateres live.

### Ændring 4 — Gruppetildeling
1. Log ind som planlægger.
2. Klik "Gruppetildeling" i headeren (eller klik "Tildel" på en opgave og skift tab).
3. Vælg en afdeling → se opgaverne med checkboxes (alle checked som default).
4. Vælg prøvetager → knap-teksten viser "Tildel X opgaver til [navn]".
5. Klik "Tildel" → alle valgte opgaver tildeles samlet.

### Ændring 5 — Tydeligere opgavekort (prøvetager)
1. Log ind som prøvetager.
2. Bemærk: Kortene har større tekst, tydeligere hastegrad-badge, og hele kortet er klikbart.
3. Klik på et kort → en detalje-modal åbner med alle oplysninger i stor tekst.
4. Detalje-modalen har handlingsknapper ("Tag opgave" / "Markér færdig").

## Kendte begrænsninger

- **Akut-modal broadcast**: Da appen kører som single-page uden real-time backend, vises akut-modalen i samme browser-session som planlæggeren. I et rigtigt setup ville dette gå via WebSocket/push til separate enheder.
- **Patient-tæller**: Starter altid på 197 ved refresh. Ingen persistering.
- **Afdelingsfordeling**: Baseret på hardcoded `DEPT_PATIENTS` i `data/data.js`. I produktion ville dette komme fra patientregistret.
- **Gruppetildeling**: Viser kun åbne opgaver (status `open`) i den valgte afdeling. Opgaver der allerede er taget vises ikke.
