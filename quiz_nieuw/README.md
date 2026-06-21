# TypeScript Quiz — SCRIPTING2 Eindopdracht

Interactieve quizapplicatie gebouwd met TypeScript. De quiz laadt vragen
vanuit een JSON-bestand en ondersteunt twee vraagtypen: meerkeuzevragen
en open vragen. Elke vraag heeft een timer.

---

## Projectstructuur

```
quiz/
│
├── index.html          ← De webpagina (drie schermen: intro, vraag, einde)
├── quiz.ts             ← Broncode in TypeScript (dit bestand bewerk je)
├── quiz.js             ← Gecompileerde versie van quiz.ts (gegenereerd door tsc)
├── tsconfig.json       ← Instellingen voor de TypeScript compiler
│
├── hoofdsteden.json    ← Quizdata: hoofdsteden
├── planeten.json       ← Quizdata: planeten
│
├── css/
│   └── style.css       ← Opmaak van de pagina
│
└── README.md           ← Dit bestand
```

---

## Vereisten

- [Node.js](https://nodejs.org/) (inclusief npm)
- TypeScript compiler (`tsc`)

---

## Installatie

### 1. Installeer de TypeScript compiler

Open een terminal en voer het volgende commando in:

```bash
npm install -g typescript
```

Controleer of de installatie gelukt is:

```bash
tsc --version
```

---

## Compileren

De browser begrijpt geen `.ts`-bestanden, dus die moeten eerst worden
omgezet naar JavaScript. Dat doe je met de TypeScript compiler (`tsc`).

### Optie A — Compileer met tsconfig (aanbevolen)

Ga in de terminal naar de projectmap en voer uit:

```bash
tsc
```

Dit leest automatisch de instellingen uit `tsconfig.json` en compileert
`quiz.ts` naar `quiz.js`.

### Optie B — Compileer een enkel bestand

```bash
tsc quiz.ts
```

> Na het compileren staat er een nieuw bestand `quiz.js` in de map.
> De browser laadt dit bestand via `<script src="quiz.js">` in `index.html`.

---

## Starten

Omdat de quiz JSON-bestanden inlaadt via `fetch()`, moet de pagina worden
geopend via een lokale webserver. Direct openen als bestand (`file://`)
werkt **niet**.

### Met de Live Server extensie (Visual Studio Code)

1. Installeer de extensie **Live Server** in VS Code
2. Klik rechtsonder op **Go Live**
3. De quiz opent automatisch in je browser

### Met Node.js (alternatief)

```bash
npx serve .
```

Open daarna `http://localhost:3000` in je browser.

---

## Een quiz toevoegen

Maak een nieuw `.json`-bestand aan in de projectmap met de volgende opbouw:

```json
{
    "intro": {
        "title": "Naam van de quiz",
        "text": "Korte beschrijving van de quiz"
    },
    "questions": [
        {
            "type": "MULTIPLECHOICE",
            "time": 10000,
            "question": "Wat is de hoofdstad van Nederland?",
            "answers": ["Amsterdam", "Rotterdam", "Den Haag", "Utrecht"],
            "correctAnswer": 0
        },
        {
            "type": "Open",
            "time": 15000,
            "question": "Wat is de langste rivier van de wereld?",
            "answers": ["Nijl", "Nile"]
        }
    ]
}
```

**Velden:**

| Veld            | Verplicht | Uitleg                                              |
|-----------------|-----------|-----------------------------------------------------|
| `type`          | Ja        | `"MULTIPLECHOICE"` of `"Open"`                      |
| `time`          | Ja        | Tijd in milliseconden (bijv. `10000` = 10 seconden) |
| `question`      | Ja        | De vraagtekst                                       |
| `answers`       | Ja        | Lijst met antwoorden                                |
| `correctAnswer` | Alleen bij MULTIPLECHOICE | Index van het juiste antwoord (begint bij 0) |

Voeg daarna een knop toe in `index.html`:

```html
<button id="knop-mijnquiz">Mijn Quiz</button>
```

En koppel de knop in `quiz.ts`:

```typescript
el("knop-mijnquiz").addEventListener("click", () => laadQuiz("mijnquiz.json"));
```

---

## TypeScript concepten in dit project

| Concept              | Waar te vinden in quiz.ts                        |
|----------------------|--------------------------------------------------|
| Types (`string`, `number`, `boolean`) | Alle velden en parameters van de klassen |
| Union types          | `type VraagType` en `type Spelstatus`            |
| Abstract class       | Klasse `Vraag`                                   |
| Inheritance (extends)| `MeerkeuzeVraag extends Vraag`, `OpenVraag extends Vraag` |
| Encapsulation        | `private` en `protected` velden met getters      |
| async / await        | Functie `laadQuiz()`                             |
| switch / case        | Functie `toonScherm()`                           |
| console.warn         | In `_maakVragen()` van de `Quiz`-klasse          |
| Timer (uitbreiding)  | Functies `startTimer()` en `werkTimerBij()`      |

---

## Rubric

| Criterium | Behaald | Bewijs |
|-----------|---------|--------|
| TypeScript gebruikt in project | ✅ | Hele quiz.ts is TypeScript met types |
| Juiste typen gebruikt | ✅ | Elke variabele, parameter en return-waarde heeft een type |
| Objecten aangemaakt | ✅ | Klassen: `Vraag`, `MeerkeuzeVraag`, `OpenVraag`, `Quiz` |
| Overerving toegepast | ✅ | `extends Vraag` bij beide subklassen |
| Encapsulation toegepast | ✅ | `private`/`protected` + getters overal |
| Nette objectoriëntatie | ✅ | Logische verdeling van verantwoordelijkheden per klasse |
| Uitbreidingen | ✅ | Timer per vraag, console.warn voor datakwaliteit |
