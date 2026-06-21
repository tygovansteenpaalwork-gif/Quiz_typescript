"use strict";
// ================================================================
// BESTAND    : quiz.ts
// PROJECT    : TypeScript Quiz — SCRIPTING2 eindopdracht
// AUTEUR     : Homo
// BESCHRIJVING: Een quiz-app die vragen laadt uit een JSON-bestand.
//               Ondersteunt meerkeuzevragen en open vragen, elk
//               met een eigen timer.
//
// WAT ZIT ER IN DIT BESTAND:
//   1. Types: string, number, boolean, null
//   2. Union types (VraagType / Spelstatus)
//   3. Klassen met private en protected velden
//   4. Overerving via abstract class en extends
//   5. Getters om velden veilig te lezen
//   6. async / await om JSON te laden
//   7. switch / case om schermen te wisselen
//   8. console.warn voor foutmeldingen in de data
//   9. Timer via setInterval
// ================================================================
// ================================================================
// BASISKLASSE: Vraag
//
// 'abstract' betekent: je kan deze klasse NIET direct gebruiken.
// Alleen MeerkeuzeVraag en OpenVraag kunnen worden aangemaakt.
//
// 'protected' betekent: het veld is toegankelijk in deze klasse
// én in klassen die hiervan erven, maar niet van buiten.
// ================================================================
class Vraag {
    // Protected velden: ook beschikbaar in subklassen
    _vraagTekst;
    _antwoorden;
    _tijdLimiet; // tijd in milliseconden
    // Constructor: dit wordt uitgevoerd als je een object aanmaakt
    constructor(vraagTekst, antwoorden, tijdLimiet) {
        this._vraagTekst = vraagTekst;
        this._antwoorden = antwoorden;
        this._tijdLimiet = tijdLimiet;
    }
    // Getters: je kan deze velden van buiten alleen lezen, niet aanpassen
    get vraagTekst() {
        return this._vraagTekst;
    }
    get tijdLimiet() {
        return this._tijdLimiet;
    }
}
// ================================================================
// SUBKLASSE: MeerkeuzeVraag
//
// 'extends Vraag' = overerving. MeerkeuzeVraag neemt alles over
// van Vraag en voegt zijn eigen logica toe.
// ================================================================
class MeerkeuzeVraag extends Vraag {
    // Private veld: alleen deze klasse zelf kan hieraan
    _juisteAntwoord;
    constructor(vraagTekst, antwoorden, tijdLimiet, juisteAntwoord) {
        // super() roept de constructor van Vraag aan
        super(vraagTekst, antwoorden, tijdLimiet);
        this._juisteAntwoord = juisteAntwoord;
    }
    // Geeft de lijst van antwoordopties terug
    get antwoorden() {
        return this._antwoorden;
    }
    // Geeft het nummer van het juiste antwoord terug
    get juisteAntwoord() {
        return this._juisteAntwoord;
    }
    // Kijkt of het geklikte antwoord (als getal) overeenkomt met het juiste antwoord
    controleerAntwoord(antwoord) {
        return parseInt(antwoord) === this._juisteAntwoord;
    }
    // Zegt wat voor type vraag dit is
    geefType() {
        return "MULTIPLECHOICE";
    }
}
// ================================================================
// SUBKLASSE: OpenVraag
//
// Erft ook van Vraag. Het antwoord wordt als tekst vergeleken.
// Hoofdletters en spaties tellen niet mee.
// ================================================================
class OpenVraag extends Vraag {
    constructor(vraagTekst, antwoorden, tijdLimiet) {
        // Roept de constructor van Vraag aan
        super(vraagTekst, antwoorden, tijdLimiet);
    }
    // Vergelijkt het ingetypte antwoord met alle geldige antwoorden.
    // .some() geeft true als minstens één antwoord klopt.
    controleerAntwoord(antwoord) {
        return this._antwoorden.some((geldigAntwoord) => geldigAntwoord.trim().toLowerCase() === antwoord.trim().toLowerCase());
    }
    // Zegt wat voor type vraag dit is
    geefType() {
        return "Open";
    }
}
// ================================================================
// KLASSE: Quiz
//
// Houdt alle vragen, de voortgang en de score bij.
// De velden zijn 'private' zodat ze van buiten niet aangepast
// kunnen worden.
// ================================================================
class Quiz {
    _titel;
    _introTekst;
    _vragen;
    _huidigeVraagIndex = 0;
    _score = 0;
    // De constructor krijgt de JSON-data als invoer.
    // We gebruiken 'any' zodat we geen aparte interface hoeven te maken.
    constructor(data) {
        this._titel = data.intro.title;
        this._introTekst = data.intro.text;
        // Zet de JSON-vragen om naar echte Vraag-objecten
        this._vragen = this._maakVragen(data.questions);
    }
    // Privémethode: zet de JSON-array om naar Vraag-objecten.
    // Alleen de Quiz-klasse zelf mag dit aanroepen.
    _maakVragen(rawVragen) {
        return rawVragen.map((ruwVraag) => {
            // Waarschuw als een vraag helemaal geen antwoorden heeft
            if (!ruwVraag.answers || ruwVraag.answers.length === 0) {
                console.warn(`Vraag heeft geen antwoorden: "${ruwVraag.question}"`);
            }
            // Maak het juiste type vraag aan
            if (ruwVraag.type === "MULTIPLECHOICE") {
                // Waarschuw als het juiste antwoord ontbreekt
                if (ruwVraag.correctAnswer === undefined) {
                    console.warn(`Meerkeuzevraag mist een correctAnswer: "${ruwVraag.question}"`);
                }
                // Gebruik 0 als standaard als correctAnswer niet is meegegeven
                return new MeerkeuzeVraag(ruwVraag.question, ruwVraag.answers, ruwVraag.time, ruwVraag.correctAnswer ?? 0);
            }
            else {
                return new OpenVraag(ruwVraag.question, ruwVraag.answers, ruwVraag.time);
            }
        });
    }
    // ---- Getters ----
    // Van buiten kan je deze waarden alleen lezen, niet wijzigen
    get titel() {
        return this._titel;
    }
    get introTekst() {
        return this._introTekst;
    }
    get score() {
        return this._score;
    }
    get aantalVragen() {
        return this._vragen.length;
    }
    // Vraagnummer voor de speler (begint bij 1, niet bij 0)
    get huidigeVraagNummer() {
        return this._huidigeVraagIndex + 1;
    }
    // Geeft de huidige vraag terug, of null als de quiz klaar is
    geefHuidigeVraag() {
        if (this._huidigeVraagIndex < this._vragen.length) {
            return this._vragen[this._huidigeVraagIndex];
        }
        return null;
    }
    // Controleert het antwoord en gaat door naar de volgende vraag.
    // Geeft terug of het antwoord goed of fout was.
    beantwoordVraag(antwoord) {
        const huidigeVraag = this.geefHuidigeVraag();
        if (!huidigeVraag)
            return false;
        const isGoed = huidigeVraag.controleerAntwoord(antwoord);
        if (isGoed)
            this._score++;
        // Ga naar de volgende vraag
        this._huidigeVraagIndex++;
        return isGoed;
    }
    // Kijkt of er nog vragen zijn
    heeftVolgendeVraag() {
        return this._huidigeVraagIndex < this._vragen.length;
    }
    // Zet de quiz terug naar het begin
    herstel() {
        this._huidigeVraagIndex = 0;
        this._score = 0;
    }
}
// ================================================================
// SPELVARIABELEN
//
// Deze variabelen houden bij wat er nu in het spel gebeurt.
// De spelstatus bepaalt welk scherm je ziet.
// ================================================================
// Het huidige quiz-object (null als er nog niets geladen is)
let quiz = null;
// Op welk scherm zit de speler nu
let spelstatus = "INTRO";
// Timer-variabelen
let timer = null; // ID van de setInterval
let tijdResterend = 0; // Hoeveel milliseconden er nog over zijn
let maximaalTijd = 0; // De starttijd van de timer
let antwoordGegeven = false; // Staat op true als de speler al geantwoord heeft
// ================================================================
// HULPFUNCTIE: el()
//
// Snelle manier om een HTML-element op te halen via zijn ID.
// 'as HTMLElement' vertelt TypeScript dat het resultaat een
// HTML-element is (zodat TypeScript niet klaagt).
// ================================================================
function el(id) {
    return document.getElementById(id);
}
// ================================================================
// SCHERMEN WISSELEN
//
// Verbergt alle schermen en toont alleen het gevraagde scherm.
// ================================================================
function toonScherm(scherm) {
    // Verberg alle schermen
    el("scherm-intro").classList.add("verborgen");
    el("scherm-vraag").classList.add("verborgen");
    el("scherm-einde").classList.add("verborgen");
    // Toon het juiste scherm
    switch (scherm) {
        case "INTRO":
            el("scherm-intro").classList.remove("verborgen");
            break;
        case "VRAAG":
            el("scherm-vraag").classList.remove("verborgen");
            break;
        case "EINDE":
            el("scherm-einde").classList.remove("verborgen");
            break;
    }
    // Sla de nieuwe schermstatus op
    spelstatus = scherm;
}
// ================================================================
// JSON INLADEN
//
// Haalt een quiz op uit een JSON-bestand.
// 'async' en 'await' zorgen dat we wachten op het bestand
// zonder de rest van de pagina te blokkeren.
// ================================================================
async function laadQuiz(bestandsnaam) {
    try {
        // Vraag het JSON-bestand op van de server
        const antwoord = await fetch(bestandsnaam);
        // Controleer of het gelukt is
        if (!antwoord.ok) {
            throw new Error(`Kan het bestand niet ophalen: ${bestandsnaam}`);
        }
        // Zet de tekst om naar een JavaScript-object
        const data = await antwoord.json();
        // Maak een nieuw Quiz-object met de ingeladen data
        quiz = new Quiz(data);
        // Ga naar het introscherm
        toonIntro();
    }
    catch (fout) {
        // Laat een foutmelding zien als het niet lukt
        alert(`Fout bij het laden van de quiz: ${fout}`);
    }
}
// ================================================================
// INTRO SCHERM
// ================================================================
// Zet de teksten van het introscherm in en toon het
function toonIntro() {
    if (!quiz)
        return;
    el("quiz-titel").textContent = quiz.titel;
    el("quiz-intro-tekst").textContent = quiz.introTekst;
    toonScherm("INTRO");
}
// Reset de quiz en toon de eerste vraag
function startQuiz() {
    if (!quiz)
        return;
    quiz.herstel();
    toonVraag();
}
// ================================================================
// VRAAG SCHERM
// ================================================================
function toonVraag() {
    if (!quiz)
        return;
    // Haal de huidige vraag op
    const huidigeVraag = quiz.geefHuidigeVraag();
    // Geen vragen meer? Ga naar het eindscherm
    if (!huidigeVraag) {
        toonEinde();
        return;
    }
    // Zet de status terug voor deze nieuwe vraag
    antwoordGegeven = false;
    toonScherm("VRAAG");
    // Bereken hoe ver de speler is (voor de voortgangsbalk)
    const voortgang = ((quiz.huidigeVraagNummer - 1) / quiz.aantalVragen) * 100;
    el("voortgangsbalk").style.width = `${voortgang}%`;
    // Toon het vraagnummer
    el("vraag-nummer").textContent = `Vraag ${quiz.huidigeVraagNummer} van ${quiz.aantalVragen}`;
    // Toon de vraagtekst
    el("vraag-tekst").textContent = huidigeVraag.vraagTekst;
    // Maak de antwoordplek leeg voor de nieuwe vraag
    const antwoordContainer = el("antwoord-container");
    antwoordContainer.innerHTML = "";
    // Verberg de feedback en de volgende-knop
    el("feedback").className = "verborgen";
    el("knop-volgende").classList.add("verborgen");
    // Toon de juiste invoer op basis van het type vraag
    if (huidigeVraag instanceof MeerkeuzeVraag) {
        // Maak per antwoord een klikbare knop
        huidigeVraag.antwoorden.forEach((antwoordTekst, index) => {
            const knop = document.createElement("button");
            knop.className = `antwoord-knop kleur-${index}`;
            knop.textContent = antwoordTekst;
            // Als de speler klikt, verwerk het antwoord
            knop.addEventListener("click", () => verwerkAntwoord(String(index), knop));
            antwoordContainer.appendChild(knop);
        });
    }
    else {
        // Open vraag: maak een tekstveld
        const invoerveld = document.createElement("input");
        invoerveld.type = "text";
        invoerveld.placeholder = "Typ je antwoord...";
        invoerveld.className = "open-invoer";
        antwoordContainer.appendChild(invoerveld);
        // Knop om het antwoord te bevestigen
        const bevestigKnop = document.createElement("button");
        bevestigKnop.className = "antwoord-knop bevestig-knop";
        bevestigKnop.textContent = "Bevestigen";
        bevestigKnop.addEventListener("click", () => {
            const ingevoerdeWaarde = invoerveld.value;
            if (ingevoerdeWaarde.trim()) {
                verwerkAntwoord(ingevoerdeWaarde, bevestigKnop);
            }
        });
        // De Enter-toets werkt ook als bevestiging
        invoerveld.addEventListener("keydown", (toetsEvent) => {
            if (toetsEvent.key === "Enter" && !antwoordGegeven) {
                const ingevoerdeWaarde = invoerveld.value;
                if (ingevoerdeWaarde.trim()) {
                    verwerkAntwoord(ingevoerdeWaarde, bevestigKnop);
                }
            }
        });
        antwoordContainer.appendChild(bevestigKnop);
        invoerveld.focus(); // Zet de cursor meteen in het tekstveld
    }
    // Start de timer voor deze vraag
    startTimer(huidigeVraag.tijdLimiet);
}
// ================================================================
// TIMER
//
// setInterval roept elke 100 milliseconden een functie aan.
// Als de tijd op is, telt de vraag automatisch als fout.
// ================================================================
function startTimer(milliseconden) {
    // Stop een vorige timer als die nog loopt
    if (timer)
        clearInterval(timer);
    tijdResterend = milliseconden;
    maximaalTijd = milliseconden;
    werkTimerBij();
    // Verlaag de timer elke 100ms
    timer = window.setInterval(() => {
        tijdResterend -= 100;
        werkTimerBij();
        // Tijd is op: stop de timer
        if (tijdResterend <= 0) {
            clearInterval(timer);
            // Alleen iets doen als de speler nog niet geantwoord heeft
            if (!antwoordGegeven) {
                tijdIsOp();
            }
        }
    }, 100);
}
// Past de timer-weergave in de HTML aan
function werkTimerBij() {
    // Reken milliseconden om naar seconden (altijd naar boven afronden)
    const seconden = Math.ceil(tijdResterend / 1000);
    el("timer").textContent = String(seconden);
    // Hoe breed moet de timerbalk zijn (in procenten)?
    const percentage = (tijdResterend / maximaalTijd) * 100;
    el("timer-balk").style.width = `${Math.max(0, percentage)}%`;
}
// Wordt aangeroepen als de speler te laat was
function tijdIsOp() {
    antwoordGegeven = true;
    // Laat zien dat de tijd op is
    const feedbackElement = el("feedback");
    feedbackElement.textContent = "Tijd is op!";
    feedbackElement.className = "feedback fout";
    // Toon de volgende-knop
    el("knop-volgende").classList.remove("verborgen");
    // Zet alle antwoordknoppen uit
    document.querySelectorAll(".antwoord-knop").forEach((knop) => {
        knop.disabled = true;
    });
    // Sla de vraag op als fout (met een speciale waarde)
    if (quiz)
        quiz.beantwoordVraag("__tijdop__");
}
// ================================================================
// ANTWOORD VERWERKEN
// ================================================================
function verwerkAntwoord(antwoord, geklikteKnop) {
    // Stop als de speler al eerder geantwoord heeft
    if (antwoordGegeven)
        return;
    antwoordGegeven = true;
    // Stop de timer
    if (timer)
        clearInterval(timer);
    // Vraag aan de Quiz-klasse of het antwoord goed is
    const isGoed = quiz.beantwoordVraag(antwoord);
    const feedbackElement = el("feedback");
    // Zet alle antwoordknoppen uit
    document.querySelectorAll(".antwoord-knop").forEach((knop) => {
        knop.disabled = true;
    });
    // Toon groen of rood aan de speler
    if (isGoed) {
        feedbackElement.textContent = "Correct!";
        feedbackElement.className = "feedback goed";
        geklikteKnop.classList.add("correct");
    }
    else {
        feedbackElement.textContent = "Fout!";
        feedbackElement.className = "feedback fout";
        geklikteKnop.classList.add("fout");
    }
    // Toon de knop voor de volgende vraag
    el("knop-volgende").classList.remove("verborgen");
}
// ================================================================
// EINDE SCHERM
// ================================================================
function toonEinde() {
    if (!quiz)
        return;
    // Stop de timer als die nog loopt
    if (timer)
        clearInterval(timer);
    toonScherm("EINDE");
    // Bereken het percentage goed
    const score = quiz.score;
    const totaalVragen = quiz.aantalVragen;
    const percentage = Math.round((score / totaalVragen) * 100);
    // Vul het eindscherm in
    el("eind-score").textContent = `${score} / ${totaalVragen}`;
    el("eind-percentage").textContent = `${percentage}%`;
}
// ================================================================
// KNOPPEN KOPPELEN AAN FUNCTIES
//
// Elke knop krijgt hier een actie.
// addEventListener luistert of er geklikt wordt en roept dan
// de bijbehorende functie aan.
// ================================================================
// Knoppen om een quiz te kiezen
el("knop-hoofdsteden").addEventListener("click", () => laadQuiz("hoofdsteden.json"));
el("knop-planeten").addEventListener("click", () => laadQuiz("planeten.json"));
// Startknop op het introscherm
el("knop-start").addEventListener("click", startQuiz);
// Volgende-knop na een vraag
el("knop-volgende").addEventListener("click", () => {
    if (quiz && quiz.heeftVolgendeVraag()) {
        toonVraag();
    }
    else {
        toonEinde();
    }
});
// Opnieuw-knop op het eindscherm
el("knop-opnieuw").addEventListener("click", toonIntro);
