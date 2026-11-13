---
name: plan-treningowy
description: Tworzy plan treningowy po polsku z ćwiczeń z bazy projektu (docs/data/exercises.json) — na podstawie szkicu użytkownika (często po angielsku) albo samego celu. Używaj, gdy użytkownik prosi o przygotowanie, ułożenie, przetłumaczenie lub optymalizację treningu, planu treningowego albo wyzwania 30-dniowego. Plan używa dokładnie istniejących ćwiczeń z bazy; brakujące ćwiczenia najpierw wypisuje użytkownikowi do akceptacji.
---

# Tworzenie planu treningowego

Cel: gotowy, praktyczny plan „mass-market” (B2C, początkujący i średniozaawansowani), po polsku, zbudowany z ćwiczeń z naszej bazy i podlinkowany do strony. Nie kopiuj szkicu 1:1 — ułóż trening **optymalnie** i zgłoś zmiany.

## Kroki (wykonuj w tej kolejności)

### 1. Zrozum szkic i cel
- Wczytaj od użytkownika: cel/temat planu, czas trwania, partie ciała, listę ćwiczeń z seriami (szkic), poziom, ewentualne ograniczenia (sprzęt).
- Czego brakuje i nie da się rozsądnie założyć — dopytaj jednym krótkim pytaniem. Rozsądne braki uzupełnij sam i zgłoś to w raporcie zmian.

### 2. Dopasuj ćwiczenia do bazy (zawsze dokładnie)
- Źródło prawdy: `docs/data/exercises.json`. Przeczytaj plik i dopasuj każde ćwiczenie ze szkicu po `nameEn` lub `name` (szkice są zwykle po angielsku).
- Używaj **dokładnie** istniejących ćwiczeń i ich polskich nazw z pola `name` — bez zmiany brzmienia, bez angielskich dopisków, bez własnych zamienników, gdy w bazie jest odpowiednik.
- Sprawdzanie jednym poleceniem (podmień listę nazw):
  ```bash
  python3 - <<'EOF'
  import json
  d=json.load(open('docs/data/exercises.json'))['exercises']
  by={e['nameEn'].lower():e for e in d}
  for w in ["Arm Circles & Wrist Circles","Plank"]:
      e=by.get(w.lower()); print(('OK ' if e else 'BRAK'), w, '->', (e['name'],e['id'],e['tags']) if e else '')
  EOF
  ```

### 3. Brakujące ćwiczenia — NAJPIERW WYPISZ, POTEM DOPIERO DODAWAJ
- Jeśli plan wymaga ćwiczenia, którego nie ma w bazie: **nie dodawaj go od razu**. Wypisz użytkownikowi tabelę propozycji: nazwa PL, nazwa EN, kategoria, partie, krótki opis, uzasadnienie (po co to ćwiczenie w planie).
- Poczekaj na zgodę. Dopiero po niej dodaj ćwiczenia do bazy zgodnie z procedurą „Dodawanie ćwiczeń do bazy” z `CLAUDE.md` (id, dozwolone tagi, tłumaczenie EN, `gif: null`, `createdAt`), a na końcu podlinkuj w planie.
- Jeśli wszystko jest w bazie, napisz wprost: „nie trzeba dodawać nowych ćwiczeń”. Nie dodawaj ćwiczeń „na zapas”.
- Do czasu zgody możesz pokazać wersję roboczą planu, w której brakujące ćwiczenie jest oznaczone (bez linku) albo zastąpione ćwiczeniem z bazy — zaznacz to wyraźnie.

### 4. Zoptymalizuj plan (nie kopiuj szkicu na ślepo)
Oceń szkic jak trener i popraw, co trzeba. Sprawdź kolejno:
- **Kolejność:** najpierw ćwiczenia dynamiczne/techniczne na świeżych mięśniach, potem siłowe, na końcu pomocnicze i objętościowe. Zadania wymagające techniki lub eksplozywności nie powinny być po serii wyczerpujących.
- **Przerwy:** dobierz do celu — ćwiczenia siłowe/dynamiczne/techniczne zwykle 2–3 min, pomocnicze 60–90 s, core i mobilność 30–60 s. Przerwa 1 min po ciężkich ćwiczeniach to zwykle za mało.
- **Czas:** policz szacunkowo (praca + przerwy + przejścia). Deklarowany czas trwania ma zgadzać się z planem — dopasuj przerwy/serie albo zmień deklarowany czas. Nie obiecuj 60 minut, gdy plan trwa 35.
- **Objętość i progresja:** sensowna liczba serii i powtórzeń dla poziomu; bez przeciążenia tych samych partii.
- **Partie ciała:** deklarowane partie w nagłówku muszą zgadzać się z tagami ćwiczeń w bazie; różnice zgłoś.
- **Rozgrzewka:** przygotowuje dokładnie te stawy i mięśnie, które pracują w części głównej (np. łopatki, nadgarstki, barki).
- **Rozciąganie:** obejmuje partie, które pracowały najmocniej.
- **Bezpieczeństwo/poziom:** jeśli plan jest wymagający, dopisz orientacyjne wymagania wstępne (oznacz jako propozycję do potwierdzenia).
- Zmieniaj tylko to, co ma uzasadnienie. Każdą zmianę względem szkicu wypisz w raporcie (krok 7).

### 5. Zbuduj plan
**Obowiązkowa struktura:**
1. **Nagłówek:** tytuł planu, czas trwania, partie ciała, częstotliwość (opcjonalnie poziom).
2. **Rozgrzewka:** krótkie ćwiczenia mobilizujące i aktywacyjne.
3. **Trening główny:** ćwiczenia właściwe, serie, powtórzenia/czas, wskazówki.
4. **Rozciąganie:** ćwiczenia wyciszające i poprawiające mobilność.

**Standard językowy (zawsze po polsku):**
- Cały plan po polsku. Nazwy ćwiczeń = pole `name` z bazy (czysto polskie, bez angielskich nawiasów).
- Partie ciała prostymi hasłami, bez anatomii: Klatka, Plecy, Barki, Biceps, Triceps, Brzuch, Uda, Pośladki, Przedramiona (np. „Plecy”, nie „najszerszy grzbietu”; „Klatka”, nie „mięśnie piersiowe”; „Brzuch”, nie „korpus”).
- Zapis serii: `4 serie po 3–5 powtórzeń`, `2 serie po 30 sekund`, `20 powtórzeń`, `2 minuty`, `30 sekund na stronę`, `30 sekund na rękę`. Pauza w zakresach to półpauza „–”.
- Przerwy podawaj jako osobną, wyraźną linię (np. „❗ Przerwa 2–3 minuty po każdej serii”).
- Ton: prosty, konkretny, motywujący, bez żargonu. Krótka wskazówka w nawiasie tylko tam, gdzie pomaga.

**Linki:** każde ćwiczenie to hiperłącze pod polską nazwą: `https://matiwan3.github.io/exercises/#<id>` (id z bazy; nigdy nie wymyślaj id — sprawdź, że istnieje).

**Stopka planu (zawsze):**
- „❓ Zastanawiasz się jak zrobić konkretne ćwiczenie? Sprawdź [bazę ćwiczeń](https://matiwan3.github.io/exercises/) lub kliknij na wybrane ćwiczenie powyżej ⤴︎”
- Disclaimer: „Plan ma charakter wyłącznie informacyjny i edukacyjny. Przed rozpoczęciem treningu upewnij się, że nie masz przeciwwskazań zdrowotnych. Wszystkie ćwiczenia wykonujesz na własną odpowiedzialność. Obciążenie należy dobrać indywidualnie do możliwości i stażu treningowego.”
- `© 2026 @matiwann`

### 6. Sprawdź przed oddaniem (checklista)
- [ ] Każde ćwiczenie jest w bazie, nazwa dokładnie jak `name`, link `#id` istnieje.
- [ ] Brak brakujących ćwiczeń — albo wypisane do akceptacji (krok 3).
- [ ] Cały tekst po polsku, partie prostymi hasłami, jednolity zapis serii.
- [ ] Szacunkowy czas zgadza się z deklarowanym.
- [ ] Partie w nagłówku zgadzają się z tagami ćwiczeń.
- [ ] Struktura i stopka kompletne.
- [ ] Wszystkie zmiany względem szkicu opisane w raporcie.

### 7. Odpowiedź dla użytkownika (kolejność)
1. Gotowy plan (Markdown z linkami).
2. **„Co zmieniłem i dlaczego”** — krótka lista zmian względem szkicu (kolejność, przerwy, dodane/usunięte ćwiczenia, czas, partie), tak aby użytkownik mógł każdą cofnąć.
3. **Nowe ćwiczenia:** „nie trzeba dodawać” albo tabela propozycji do akceptacji.
4. Krótkie pytanie, czy zapisać plan jako PDF/DOCX (tylko na prośbę — wtedy użyj odpowiedniego skilla; wygląd: grafika nagłówka „PLAN TRENINGOWY <nazwa>”, sekcje w kolorze koralowym `#ff4d55`, serie i czasy pogrubione).

Nie commituj ani nie pushuj bez prośby; nie zmieniaj kodu strony ani CRM-a przy okazji tworzenia planu.

## Opis sprzedażowy produktu (na prośbę)
Gdy użytkownik chce opis produktu na Naffy (lub mail pozakupowy) do nowego planu: użyj szablonu `produkty/_szablon-opisu-produktu.md` (wariant A — plan treningowy, wariant B — wyzwanie 30-dniowe) i zasad stylu z jego nagłówka. Dane (czas, liczba ćwiczeń w sekcjach, częstotliwość, warunek wstępny) bierz z gotowego planu — nie zgaduj. Cenę i link pozostaw jako pola do uzupełnienia, jeśli ich nie znasz. Zapisuj do `produkty/produkt - <skrót>.md`.

## Wyzwanie 30-dniowe (format codzienny)
5 minut dziennie rano po przebudzeniu, 30 dni bez przerw, 3 fazy po 10 dni (rosnący poziom trudności). Schemat dnia: 1 min rozgrzewka + 3 min trening główny + 1 min rozciąganie. Te same zasady: ćwiczenia z bazy, polski standard, linki, stopka.

## Wzorzec planu (przykład formatu)

> ### PLAN TRENINGOWY: PIERWSZE PODCIĄGNIĘCIE
> - **Czas trwania:** 45 minut
> - **Partie ciała:** Plecy, Biceps, Przedramiona, Brzuch
> - **Częstotliwość:** 2–3 razy w tygodniu (z minimum 1 dniem przerwy między sesjami)
>
> **Rozgrzewka**
> - [Krążenia ramion i nadgarstków](https://matiwan3.github.io/exercises/#krazenia-ramion-i-nadgarstkow) – 1 minuta
> - [Aktywacja łopatek w zwisie](https://matiwan3.github.io/exercises/#aktywacja-lopatek-w-zwisie) – 2 serie po 8–10 powtórzeń
> - [Odciąganie gumy](https://matiwan3.github.io/exercises/#odciaganie-gumy-band-pull-aparts) – 2 serie po 15 powtórzeń
>
> **Trening główny**
> - [Negatywne podciąganie](https://matiwan3.github.io/exercises/#negatywne-podciaganie) – 4 serie po 3–5 powtórzeń *(wyskocz nad drążek i powoli opuszczaj się przez 4–5 sekund)*
> - [Podciąganie z gumą oporową](https://matiwan3.github.io/exercises/#podciaganie-z-guma-oporowa) LUB [Podciąganie australijskie](https://matiwan3.github.io/exercises/#podciaganie-australijskie) – 3 serie po 6–8 powtórzeń *(dobierz gumę lub kąt nachylenia tak, aby ostatnie 2 powtórzenia były wymagające)*
> - [Zwis na drążku](https://matiwan3.github.io/exercises/#zwis-na-drazku) – 3 serie po 30 sekund *(wzmocnienie chwytu i przedramion)*
> - [Deska klasyczna](https://matiwan3.github.io/exercises/#deska-klasyczna-plank) – 3 serie po 30–45 sekund
>
> **Rozciąganie**
> - [Rozciąganie klatki i pleców na drążku](https://matiwan3.github.io/exercises/#rozciaganie-klatki-i-plecow-na-drazku) – 30 sekund
> - [Rozciąganie tricepsa i najszerszego grzbietu](https://matiwan3.github.io/exercises/#rozciaganie-tricepsa-i-najszerszego-grzbietu) – 30 sekund na stronę
> - [Rozciąganie zginaczy i prostowników nadgarstków](https://matiwan3.github.io/exercises/#rozciaganie-zginaczy-i-prostownikow-nadgarstkow) – 30 sekund na rękę
