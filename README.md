# Exercises

Statyczna strona z ćwiczeniami (GitHub Pages) + lokalny panel CRM. Szczegóły i wymagania: [CLAUDE.md](CLAUDE.md).

## Dodawanie ćwiczeń
```bash
npm run crm        # http://localhost:4000
git add -A && git commit -m "Dodaj ćwiczenia" && git push
```

## Podgląd strony lokalnie
```bash
npm run site       # http://localhost:4001
```

## Publikacja
GitHub → Settings → Pages → Source: `Deploy from a branch` → `main` / `/docs`.
Strona: https://matiwan3.github.io/exercises/
