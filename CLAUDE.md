# Exercises — wymagania projektu

Projekt składa się z trzech warstw. Dane płyną jednokierunkowo:

```
CRM (lokalny panel)  →  lekka baza (pliki w gicie)  →  statyczna strona (GitHub Pages)
```

## 1. CRM (`crm/`)
### Wymagania funkcjonalne CRM
- **Dodawanie** ćwiczenia (nazwa wymagana).
- **Modyfikacja** istniejącego ćwiczenia (nazwa, opis, tagi, GIF).
- **Usuwanie** ćwiczenia (z potwierdzeniem; usuwa też jego GIF z dysku).
- **Tagi** — dowolna liczba na ćwiczenie (np. partia mięśniowa, sprzęt), zapisywane małymi literami, bez duplikatów.
- **Opis** — wolny tekst.
- **GIF** — **maksymalnie 1 na ćwiczenie**, wyłącznie format GIF. Wgranie nowego zastępuje stary (stary plik jest kasowany); można też usunąć GIF bez usuwania ćwiczenia.

### Zasady implementacji CRM
- Dodawanie nowych ćwiczeń: nazwa, opis, tagi, GIF.
- W pełni natywny: czysty Node.js (>=18) + vanilla HTML/CSS/JS. **Bez zależności npm, bez frameworków, bez builda.**
- Prosty, interaktywny, łatwe dodawanie i usuwanie ćwiczeń (edycja też).
- Działa wyłącznie lokalnie (`npm run crm` → http://localhost:4000, nasłuch tylko na 127.0.0.1). Nie jest publikowany.
- Zapisuje bezpośrednio do bazy (patrz niżej); publikacja = ręczny `git commit` + `git push`.
- Upload GIF-a: tylko pliki GIF (sprawdzane po magic bytes), limit 15 MB.

## 2. Lekka baza (`docs/data/` + `docs/gifs/`)
- Źródłem prawdy jest `docs/data/exercises.json` — przechowywany w gicie (historia zmian za darmo).
- GIF-y w `docs/gifs/`, nazwa `<id>-<timestamp>.gif`; pole `gif` w rekordzie to sama nazwa pliku (lub `null`).
- Schemat ćwiczenia: `id` (slug, unikalny), `name`, `description`, `tags[]` (małe litery), `gif`, `createdAt`, `updatedAt` (ISO).
- Format JSON z wcięciem 2 spacje (czytelne diffy). Tagi mogą też być edytowane ręcznie w pliku.
- Zmieniając schemat: podnieś `version` i zaktualizuj CRM oraz stronę razem.

## 3. Statyczna strona (`docs/`)
- Hostowana na GitHub Pages z folderu `/docs` gałęzi `main` (Settings → Pages).
- Czyta `data/exercises.json` w przeglądarce — bez backendu.
- Wyświetla listę ćwiczeń z GIF-ami, **wyszukiwaniem, filtrowaniem po tagach (AND) i sortowaniem** (nazwa A–Z/Z–A, najnowsze/najstarsze).
- Wygląd: **jasny motyw** („premium”), dopasowany do nagłówka: kremowe tło, czarny tekst, koralowy akcent (`#ff4d55`), font nagłówków Anton.
- Ćwiczenia wyświetlane jako kontenery na całą szerokość, jeden pod drugim: szare tło (`--card`, #d9d9d9), po lewej GIF (białe pole), po prawej pogrubiona nazwa, opis wyjustowany i kolorowe tagi (czarny tekst).
- Kolory tagów: paleta `--tag-0..5` w CSS; kolor wybierany stabilnie po haszu nazwy tagu (`tagColor` w JS), więc ten sam tag ma zawsze ten sam kolor na stronie i w CRM.
- Nagłówek strony to grafika `docs/img/page_header.png` (przezroczysta, czarny napis) wprost na jasnym tle (`.banner`). Grafiki muszą leżeć w `docs/`, inaczej Pages ich nie opublikuje.
- **Ujednolicone kolory i fonty:** wszystkie w tokenach CSS na górze `docs/css/style.css` (`--accent`, `--font-display`, …). Strona i CRM używają tego samego pliku — nie wpisuj kolorów/fontów gdzie indziej.
- **Ujednolicony język:** interfejs po polsku; wszystkie teksty UI są w obiekcie `T` na górze `docs/js/app.js` i `crm/app.js`. Nowy tekst dodawaj tam, nie inline.

## Zasady pracy
- Prostota ponad rozbudowę: bez bibliotek i bundlerów, dopóki nie ma realnej potrzeby.
- Treści z danych wstawiaj przez `textContent` (nigdy `innerHTML`).
- Ścieżki na stronie względne (`data/…`, `gifs/…`), bo Pages serwuje z podścieżki `/exercises/`.
- Podgląd samej strony lokalnie: `npm run site` → http://localhost:4001 (CRM: `npm run crm` → http://localhost:4000, mogą działać równocześnie).
- Stopka: disclaimer (informacyjny/edukacyjny, własna odpowiedzialność) oraz `© 2026 | youtube | sklep`. Linki w tablicy `LINKS` w `docs/js/app.js` (sklep: https://www.naffy.io/matiwan); link z pustym adresem się nie wyświetla.
