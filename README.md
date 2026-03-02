# ADBIS26 - Klikbar designprototype (frontend only)

Ren frontend-prototype i **React + TypeScript + Vite + Tailwind**.

Formål: demonstrere flows, skærmbilleder, interaktion, mikrocopy og robuste UI-states for tre roller:
- Rekvirerende afdeling
- Bioanalytiker (Zebra/Android)
- Planlægger/Koordinator

Der er **ingen backend, ingen database, ingen auth**. Alt data er mock/dummy og ligger lokalt i koden.

## Start projektet

```bash
npm install
npm run dev
```

Åbn derefter den lokale Vite-url i browseren (typisk `http://localhost:5173`).

## Filstruktur (MVC + views)

```text
src/
  controllers/
    useAppController.ts
    useScreenDemoController.ts
  mock/
    data.ts
  models/
    types.ts
    selectors.ts
    store.tsx
  views/
    components/
      ui/
      shared/
    layouts/
    screens/
      bioanalytiker/
      planner/
      requester/
      HomeScreen.tsx
  routes.ts
  App.tsx
  main.tsx
  index.css
```

## Routes-oversigt

Alle skærme er samlet i `src/routes.ts`.

Vigtigste ruter:
- `/` - rollevalg / prototype-start
- `/bio` - Bioanalytiker: Min vagt
- `/bio/opgaver` - Bioanalytiker: Opgaveliste
- `/bio/opgaver/:taskId` - Bioanalytiker: Opgavedetalje
- `/bio/opgaver/:taskId/afmeld` - Bioanalytiker: Afmeld opgave
- `/plan` - Planlægger: Overblik / heatmap
- `/plan/tildeling` - Planlægger: Tildeling (drag-and-drop UI)
- `/plan/beskeder/:taskId` - Planlægger: Kommunikation
- `/rekvirent/opret` - Rekvirent: Opret opgave
- `/rekvirent/kvittering/:taskId` - Rekvirent: Bekræftelsesskærm
- `/rekvirent/status` - Rekvirent: Status på egne opgaver

## Hvilke flows kan klikkes igennem

### 1) Bioanalytiker (Zebra/Android flow)
- `Min vagt` -> `Se mine opgaver`
- `Opgaveliste` -> filtrer `Mine / Team / Akutte`
- `Opgavedetalje` -> `Tag opgave` -> `Start` -> `Markér færdig`
- `Brug for hjælp` fra dashboard eller detalje (vises på planlægger-overblik)
- `Afmeld opgave` med årsag + konsekvenstekst + ekstra friktion nær fyraften (demo-klokke)
- Ekstra tjek-flow for hver 5. standardpatient (akut undtagelse)

### 2) Planlægger / Koordinator
- `Overblik` med afdeling/område-kolonner, belastningsindikatorer, hjælpesignaler og morgenrunde-progress
- `Tildeling` med drag-and-drop (UI-only) til team eller medarbejder
- `Lås opgave til team` toggle (anti-misbrug)
- `Kommunikation` pr. opgave med chat-tråd + skabelonbeskeder

### 3) Rekvirerende afdeling
- `Opret opgave` (1 skærm / 3 trin samlet)
- `Opgave sendt` kvittering med forventet respons
- `Status på egne opgaver` med status og seneste opdatering

## UX States (Loading / Empty / Error / Offline)

Alle skærme har en **Demo-tilstand** øverst, hvor du kan demonstrere:
- `Normal`
- `Loading` (skeletons)
- `Empty`
- `Error` (med `Prøv igen` + fallback-visning)
- `Offline` (banner + læsevisning uden opdatering)

Der er også demo-klokke (morgen / midt på dag / nær fyraften), som påvirker:
- morgenrunde-status
- nedtælling til auto-tildeling
- ekstra friktion ved afmelding nær fyraften

## Interaktioner implementeret

- Toasts ved: `Tag opgave`, `Start`, `Markér færdig`, `Brug for hjælp`, `Afmeld opgave`, `Opret opgave`
- Rigtig nedtælling i frontend for `Auto-tildeles om MM:SS`
- Hjælpeanmodning fra bioanalytiker vises i planlægger-overblik med tidsstempel
- Planlægger kan låse opgave til team (UI-toggle)
- Hver 5. standardopgave markeres med `Ekstra tjek` (mock-logik i `src/mock/data.ts` og ved nyoprettede opgaver)

## Antagelser (prototype)

1. Én aktiv bioanalytiker i demoen er sat som `Sara Holm` (`bio-03`).
2. Rekvirerende afdeling i demoen er forudvalgt som `Medicinsk Afsnit`.
3. Auto-tildeling efter 15 min sker lokalt i reduceren (ingen serverlogik).
4. Drag-and-drop er kun UI-adfærd; ingen persistens udenfor browser-session.
5. Chat er lokal mock-tråd pr. opgave.
6. "Afmeld opgave" betyder i praksis "send tilbage til kø / team-kø" (ikke sletning).
7. Nær fyraften simuleres via demo-klokke (`Nær fyraften`).
8. Tidsvindue for morgenrunde er hardcoded 07:30-09:00.
9. Tilgængelighed er håndteret på minimumsniveau (fokus-styles, keyboard-klikbare kontroller, høj kontrast, tekst + ikoner).
10. Prototype prioriterer demonstrerbarhed og flow frem for pixelperfekt produktionstilstand.

## Design rationale (10 konkrete UX-beslutninger)

1. **Stor primær CTA pr. skærm** for at reducere valgtræthed under tidspres.
2. **Segmenteret filter (Mine/Team/Akutte)** i bio-opgaveliste for hurtig mental scanning.
3. **Auto-tildeling som synlig nedtælling** gør semitvungen logik forståelig før den sker.
4. **Offline-banner med seneste opdateringstid** skaber tillid og forklarer hvorfor opdateringer er låst.
5. **Skeleton loaders i stedet for kun spinner** giver bedre performance-fornemmelse på ustabilt net.
6. **Ekstra tjek kun på hver 5. standardpatient (akut undtagelse)** balancerer sikkerhed og tempo.
7. **Afmeld kræver årsag + konsekvenstekst** for at minimere misbrug uden at blokere nødvendige afmeldinger.
8. **Ekstra friktion nær fyraften (kontakt planlægger + bekræftelse)** tydeliggør ansvar på kritiske tidspunkter.
9. **Planlægger-overblik bruger farve + ikon + tekstlabel** så belastning ikke kun kommunikeres via farve.
10. **Lås opgave til team** reducerer risiko for "skub videre"-adfærd og holder ansvar tæt på teamet.

## Bemærkning om lokal verifikation

Jeg kunne ikke fuldføre `npm install` i dette miljø (ingen dependencies blev installeret her), så projektet er ikke bygget lokalt i denne session. Koden er skrevet til at kunne køre med:
- `npm install`
- `npm run dev`

Hvis du vil, kan jeg i næste step lave en målrettet compile-pass efter du har kørt install (eller hvis netværk bliver tilgængeligt i miljøet).
