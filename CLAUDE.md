# Exercises — instrukcje projektu

## 0. Cel i sposób współpracy

- **Cel:** proste, bardzo praktyczne, „mass-market gotowe” cyfrowe produkty treningowe — wyzwania 30-dniowe, plany gotowe do druku/PDF, bazy edukacyjne.
- **Grupa docelowa:** szeroki rynek (B2C), osoby początkujące i średniozaawansowane.
- **Jak pracujemy:** ćwiczenia do bazy i plany treningowe tworzymy **razem, bezpośrednio w tej sesji** — zamiast Gemini i Google Sheets (arkusz/CSV nie jest już używany). **Źródłem prawdy jest `docs/data/exercises.json`.**
- **Język:** domyślnie polski, ale każde ćwiczenie ma angielski odpowiednik (`nameEn`, `descriptionEn`) pod ewentualne skalowanie na rynki zagraniczne.
- **Prostota:** żadnej skomplikowanej anatomii — proste hasła zrozumiałe dla każdego (Klatka, Plecy, Barki, Pośladki…).
- **Linkowanie:** hiperłącza podklejamy pod polskie nazwy ćwiczeń (patrz „Linki do ćwiczeń”).
- Nic nie commituj ani nie pushuj bez prośby użytkownika; po większych zmianach zaproponuj commit + push.

## 0.1 Dodawanie ćwiczeń do bazy (workflow Claude)

Wejście: tabela od użytkownika — nazwa PL, nazwa EN, kategoria, partie, opis (czasem sprzęt). Kroki:

1. **Zapisz do `docs/data/exercises.json`** (format: JSON z wcięciem 2 spacje, polskie znaki bez escapowania). Nie wymyślaj ćwiczeń ani opisów, o które użytkownik nie prosił.
2. **`id`** = slug polskiej nazwy tak jak `slugify` w `crm/server.js` (małe litery, `ł`→`l`, bez diakrytyków, myślniki), unikalny. Nigdy nie zmieniaj `id` istniejącego ćwiczenia (psuje linki).
3. **Tagi** = kategoria + partie, małymi literami, **wyłącznie z dozwolonych list**:
   - Kategorie: `kalistenika`, `siłownia`, `rozgrzewka`, `rozciąganie`.
   - Partie: `klatka`, `plecy`, `barki`, `biceps`, `triceps`, `brzuch`, `uda`, `pośladki`, `przedramiona`.
   - Nowy tag to wyjątek — najpierw zapytaj. Wymaga wpisu w `docs/data/tags.json` (tłumaczenie `en` + `color` = najrzadziej używany indeks 0–12).
4. **EN:** `nameEn` z tabeli; `descriptionEn` przetłumacz sam (naturalny, prosty angielski). Języki się nie mieszają.
5. **Opis PL** wklej wiernie; popraw tylko oczywiste literówki i **zgłoś to użytkownikowi**.
6. `gif: null` (użytkownik wgrywa GIF w CRM), `createdAt`/`updatedAt` = teraz (ISO), rosnąco co 1 s w kolejności z tabeli.
7. Sprawdź duplikaty (po `name` i `nameEn`) i poprawność JSON-a.
8. Na koniec podaj listę dodanych ćwiczeń z linkami `#id`.

## 0.2 Tworzenie planów treningowych (workflow Claude)

**Obowiązkowa struktura każdego planu:**

- **Nagłówek:** tytuł planu, czas trwania, partie ciała, częstotliwość.
- **Rozgrzewka:** krótkie ćwiczenia mobilizujące i aktywacyjne.
- **Trening główny:** ćwiczenia właściwe, serie, powtórzenia/czas, wskazówki.
- **Rozciąganie:** ćwiczenia wyciszające i poprawiające mobilność.

**Zasady:**

- Każde ćwiczenie w planie **musi istnieć w bazie**. Nazwa PL dokładnie jak w bazie, z hiperłączem `https://matiwan3.github.io/exercises/#<id>`. Brakujące ćwiczenia zaproponuj dodać do bazy przed publikacją planu.
- Zapis serii: `Nazwa: 4x 3-5`, czasy: `2 x 30 sekund`, `30 sekund (na stronę)`. Ważne uwagi jako osobna linia, np. „Po każdym ćwiczeniu 1 minuta przerwy”.
- Stopka planu: „Zastanawiasz się jak zrobić konkretne ćwiczenie? Sprawdź bazę ćwiczeń (link) lub kliknij na wybrane ćwiczenie powyżej”, potem disclaimer („Plan ma charakter wyłącznie informacyjny i edukacyjny. Przed rozpoczęciem treningu upewnij się, że nie masz przeciwwskazań zdrowotnych. Wszystkie ćwiczenia wykonujesz na własną odpowiedzialność. Obciążenie należy dobrać indywidualnie do możliwości i stażu treningowego.”) i `© 2026 @matiwann`.
- Wygląd dotychczasowych PDF-ów: grafika nagłówka „PLAN TRENINGOWY <nazwa>” (czarny napis, koralowy akcent), sekcje w kolorze koralowym, serie/czasy pogrubione.
- Format wyjściowy: domyślnie Markdown w czacie z działającymi linkami; PDF/DOCX tylko na prośbę.

**Wzorzec planu (przykład):**

> ### PLAN TRENINGOWY: PIERWSZE PODCIĄGNIĘCIE
> - **Czas trwania:** 45 minut
> - **Partie ciała:** Plecy, Biceps, Przedramiona, Brzuch
> - **Częstotliwość:** 2–3 razy w tygodniu (minimum 48h przerwy między sesjami)
>
> **Rozgrzewka**
> - Krążenia ramion i nadgarstków – 1 minuta
> - Aktywacja łopatek w zwisie – 2 serie po 8–10 powtórzeń
> - Odciąganie gumy – 2 serie po 15 powtórzeń
>
> **Trening główny**
> - Negatywne podciąganie – 4 serie po 3–5 powtórzeń *(wyskocz nad drążek i powoli opuszczaj się przez 4–5 sekund)*
> - Podciąganie z gumą oporową LUB Podciąganie australijskie – 3 serie po 6–8 powtórzeń *(dobierz gumę lub kąt nachylenia tak, aby ostatnie 2 powtórzenia były wymagające)*
> - Zwis na drążku – 3 serie po 30 sekund *(wzmocnienie chwytu i przedramion)*
> - Deska klasyczna – 3 serie po 30–45 sekund
>
> **Rozciąganie**
> - Rozciąganie klatki i pleców na drążku – 30 sekund
> - Rozciąganie tricepsa i najszerszego grzbietu – 30 sekund na stronę
> - Rozciąganie zginaczy i prostowników nadgarstków – 30 sekund na rękę

**Wyzwanie 30-dniowe (format codzienny):** 5 minut dziennie rano po przebudzeniu, 30 dni bez przerw, 3 fazy po 10 dni. Schemat dnia: 1 min rozgrzewka + 3 min trening główny + 1 min rozciąganie.

## 1. Architektura

Trzy warstwy; dane płyną jednokierunkowo:

```
CRM (lokalny panel)  →  lekka baza (pliki w gicie)  →  statyczna strona (GitHub Pages)
```

## 2. CRM (`crm/`)

### Wymagania funkcjonalne
- **Dodawanie** ćwiczenia (nazwa wymagana).
- **Modyfikacja** istniejącego ćwiczenia (nazwa, opis, tagi, GIF, wersja EN).
- **Usuwanie** ćwiczenia (z potwierdzeniem; usuwa też jego GIF z dysku).
- **Tagi** — dowolna liczba na ćwiczenie, zapisywane małymi literami, bez duplikatów.
- **Opis** — wolny tekst. Każde ćwiczenie ma też wersję EN: `Nazwa (EN)`, `Opis (EN)`; tagi tłumaczy się w sekcji „Tagi — tłumaczenia EN”.
- **GIF** — **maksymalnie 1 na ćwiczenie**, wyłącznie format GIF. Wgranie nowego zastępuje stary (stary plik jest kasowany); można też usunąć GIF bez usuwania ćwiczenia.

### Zasady implementacji
- W pełni natywny: czysty Node.js (>=18) + vanilla HTML/CSS/JS. **Bez zależności npm, bez frameworków, bez builda.**
- Prosty, interaktywny, łatwe dodawanie i usuwanie ćwiczeń (edycja też).
- Działa wyłącznie lokalnie (`npm run crm` → http://localhost:4000, nasłuch tylko na 127.0.0.1). Nie jest publikowany.
- Zapisuje bezpośrednio do bazy; publikacja = `git commit` + `git push`.
- Upload GIF-a: tylko pliki GIF (sprawdzane po magic bytes), limit 15 MB.
- CRM jest tylko po polsku: teksty w obiekcie `T` na górze `crm/app.js`. Nowy tekst dodawaj tam, nie inline.

## 3. Lekka baza (`docs/data/` + `docs/gifs/`)
- Źródłem prawdy jest `docs/data/exercises.json` — przechowywany w gicie (historia zmian za darmo).
- GIF-y w `docs/gifs/`, nazwa `<id>-<timestamp>.gif`; pole `gif` w rekordzie to sama nazwa pliku (lub `null`).
- Schemat ćwiczenia: `id` (slug, unikalny), `name`, `nameEn`, `description`, `descriptionEn`, `tags[]` (kanoniczne, polskie, małe litery), `gif`, `createdAt`, `updatedAt` (ISO).
- `docs/data/tags.json`: słownik tagów `{ "<tag>": { "en": "<tłumaczenie>", "color": 0–12 } }`. Kolor to indeks palety `--tag-0..12` — przydzielany automatycznie przez CRM nowemu tagowi (najrzadziej używany), stały i unikalny dopóki są wolne kolory. Tłumaczenia edytuje się w CRM.
- Informacja o sprzęcie (drążek, guma, sztanga…) nie jest przechowywana — baza nie ma na to pola. Jeśli sprzęt ma być widoczny, dodaj osobne pole albo tagi sprzętu (ustal z użytkownikiem).
- Format JSON z wcięciem 2 spacje (czytelne diffy).
- Zmieniając schemat: podnieś `version` i zaktualizuj CRM oraz stronę razem.

## 4. Statyczna strona (`docs/`)
- Hostowana na GitHub Pages z folderu `/docs` gałęzi `main` — https://matiwan3.github.io/exercises/.
- Czyta `data/exercises.json` i `data/tags.json` w przeglądarce — bez backendu.
- Lista ćwiczeń z GIF-ami, **wyszukiwaniem, filtrowaniem po tagach (AND) i sortowaniem** (nazwa A–Z/Z–A, najnowsze/najstarsze).
- Wygląd: **jasny motyw** („premium”): lekko szare tło strony (`--bg` #f0f0f0), czarny tekst, koralowy akcent (`#ff4d55`), font nagłówków Anton.
- Ćwiczenia jako kontenery na całą szerokość, jeden pod drugim: szare tło (`--card`, #d9d9d9), lekko zaokrąglone rogi, po lewej GIF (białe pole), po prawej pogrubiona nazwa, opis wyjustowany i kolorowe tagi (czarny tekst).
- Kolory tagów: paleta 13 odrębnych kolorów `--tag-0..12` w CSS; indeks koloru każdego tagu jest w `docs/data/tags.json` (strona i CRM czytają to samo). Awaryjnie (brak wpisu) kolor z hasha nazwy.
- Nagłówek strony: grafika `docs/img/page_header.png` (przezroczysta, czarny napis) wprost na tle strony (`.banner`). Grafiki muszą leżeć w `docs/`, inaczej Pages ich nie opublikuje.
- **Ujednolicone kolory i fonty:** wszystkie w tokenach CSS na górze `docs/css/style.css` (`--accent`, `--highlight`, `--font-display`, …). Strona i CRM używają tego samego pliku — nie wpisuj kolorów/fontów gdzie indziej.
- **Dwie wersje językowe (PL / EN):** jeden przełącznik (suwak) w prawym górnym rogu; wybór zapamiętany w `localStorage` i w `?lang=pl|en`. Języki się nie mieszają — cały interfejs (obiekt `I18N` na górze `docs/js/app.js`), treści ćwiczeń i nazwy tagów są w wybranym języku. Gdy brakuje tłumaczenia ćwiczenia lub tagu, strona pokazuje wersję polską. Nagłówek PL to grafika, EN to tekst w tym samym stylu (grafika jest po polsku).
- Stopka: disclaimer („Baza ćwiczeń ma charakter wyłącznie informacyjny i edukacyjny…”) oraz `matiwan © 2026 | youtube | sklep`. Linki w tablicy `LINKS` w `docs/js/app.js` (sklep: https://www.naffy.io/matiwan, youtube: https://www.youtube.com/@matiwann); link z pustym adresem się nie wyświetla.

## 5. Linki do ćwiczeń (permalinki)
- Każde ćwiczenie ma stałe `id`. Adres `https://matiwan3.github.io/exercises/#<id>` otwiera stronę przy tym ćwiczeniu: zdejmuje filtry, przewija do niego i podświetla je granatową ramką (`--highlight`; `focusFromHash` w `docs/js/app.js`). Opcjonalnie `?lang=en` wymusza język.
- `id` **nie zmienia się przy zmianie nazwy** — nie edytuj go ręcznie i nie usuwaj ćwiczeń podlinkowanych w PDF-ach.
- Na stronie **nazwa ćwiczenia jest linkiem** (bez osobnego przycisku — celowo, żeby nie wprowadzać zamieszania); kliknięcie wpisuje `#<id>` w pasek adresu. W CRM przy każdym ćwiczeniu jest przycisk „Link” kopiujący adres (adres strony w `SITE_URL` w `crm/app.js`).

## 6. Zasady pracy (kod)
- Prostota ponad rozbudowę: bez bibliotek i bundlerów, dopóki nie ma realnej potrzeby.
- Treści z danych wstawiaj przez `textContent` (nigdy `innerHTML`).
- Ścieżki na stronie względne (`data/…`, `gifs/…`), bo Pages serwuje z podścieżki `/exercises/`.
- Podgląd strony lokalnie: `npm run site` → http://localhost:4001 (CRM: `npm run crm` → http://localhost:4000, mogą działać równocześnie).
- Nie ubijaj procesów po nazwie (`pkill`) — użytkownik może mieć uruchomiony własny serwer; testuj na osobnym porcie (`PORT=40xx`) i zabijaj tylko swój PID.
