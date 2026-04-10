# 🏥 DENTYMD App - Enterprise Dental Management Platform

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

Acest repository conține codul sursă pentru platforma integrată a clinicii stomatologice, cuprinzând un front-end orientat spre conversie (Landing Page) și un sistem complex de gestiune a resurselor (ERP/CRM) de tip panou de administrare (DentyAdmin). Arhitectura este proiectată pentru scalabilitate, reziliență și tipizare strictă de la baza de date până la interfața grafică.

---

## 🏗️ Arhitectura și Structura Proiectului

Aplicația respectă principiile arhitecturale moderne bazate pe **React Server Components (RSC)** și deleagă logica de business către **Server Actions**, minimizând astfel overhead-ul de pe client.

```text
/
├── prisma/                 # ORM, definitia schemei BD și fișierele de migrare SQL
├── src/
│   ├── app/                # Next.js App Router (Paginile de UI & layouts)
│   │   ├── admin/          # Panoul de CRM (privat, acces protejat de Middleware)
│   │   └── actions/        # Server Actions - logica tranzacțională de backend 
│   ├── components/         # Componente pure de UI (Shadcn/Radix UI/Tailwind)
│   ├── lib/                # Configurații partajate, prisma client, validări Zod
│   └── types/              # Definiții de tipuri TypeScript globale
├── Dockerfile              # Multi-stage build (deps -> builder -> runner)
├── docker-compose.yml      # Orchestator servicii (PostgreSQL, App)
└── next.config.ts          # Config base (Standalone Output Output activat)
```

---

## 💻 Stack Tehnologic (Tech Stack)

### Frontend & UI
*   **Next.js 16 (App Router)** via Turbopack, oferind randare hibridă (SSR, SSG)
*   **Tailwind CSS v4** cuplate cu **Shadcn UI** & **Radix UI** pentru un design system premium, complet accesibil (a11y).
*   **React Hook Form** împreună cu **Zod** pentru un control formidabil al stării formularelor și validarea schemelor end-to-end.
*   **Tiptap / Editor.js** pentru capabilități bogate de scriere texte (Rich-Text).

### Backend & Infrastructură
*   **Bază de date:** PostgreSQL (în Docker) / SQLite (dev)
*   **ORM layer:** Prisma Client (garantează siguranța tipurilor în timpul interogărilor BD)
*   **Securitate:** Sesiuni HTTP-only, Middleware pentru ruting protejat, `bcryptjs` pentru hashing-ul securizat al parolelor.
*   **DevOps:** Dockerizare Multi-Stage (imaginile bazate pe `node:20-slim`) reducând suprafața de atac și dimensiunea imaginii rulate ("standalone mode").

---

## 💾 Gestiunea Bazei de Date (Proceduri pentru DevOps & DBAs)

> **ATENȚIE:** Pentru a garanta integritatea datelor în producție, ORM-ul Prisma este folosit sub un regim strict de versiuni (Migrations). Nu se va folosi **niciodată** comanda `prisma db push` în mediile de *Staging* sau *Producție*, aceasta fiind o tehnică de prototipare extrem de distructivă care poate face drop la tabele.

### Cum să adaugi un Tabel Nou (Fără Pierderi de Date)

Acest flux descrie un update incremental de schemă, așa cum se aplică la nivel *Enterprise*:

**Pasul 1: Modificarea modelului declarativ**
Deschide `prisma/schema.prisma` și declară noua entitate. Asigură-te că folosești relații explicite dacă tabelul nou se leagă de date existente.

```prisma
// exemplu in schema.prisma
model ServiciuNou {
  id          String   @id @default(cuid())
  nume        String
  pret        Float
  createdAt   DateTime @default(now())
}
```

**Pasul 2: Generarea migrării locale (Dezvoltare)**
În terminal, generează scriptul curat de SQL folosind utilitarul de migrare Prisma. **Acest pas track-uiește exact diff-ul față de baza de date anterioară!**

```bash
npx prisma migrate dev --name adaugat_tabel_serviciu_nou
```
*Acțiunea va formula un fișier de tip `YYYYMMDDHHMMSS_adaugat_tabel_serviciu_nou/migration.sql` în folderul `prisma/migrations` și va aplica instant schimbarea pe mediul tău de dezvoltare (SQLite local).*

**Pasul 3: Actualizarea schemelor în TypeScript**
Trebuie să regenerezi Prisma Client local pentru ca IntelliSense-ul și TS să cunoască noile tipuri de date:
```bash
npx prisma generate
```

**Pasul 4: Aplicarea migrării în Mediul de Producție (Docker)**
Infrastructura curentă folosește Docker Compose. Când aplicația va rula în pipeline-ul de CI/CD sau când este refăcut containerul de producție, nu folosi `migrate dev`. Folosești procedura idempotentă de tip *deploy*:

```bash
npx prisma migrate deploy
```
*Această comandă verifică tabela istorică de migrații Prisma (existentă în baza PostgreSQL de producție), vede că lipsește migrarea `...adaugat_tabel_serviciu...` și execută strict fișierul `.sql` pur aferent acelei migrații. Totul se întâmplă tranzacțional: dacă dă rateu, scriptul se oprește lăsând datele curente exact cum erau.*

### Best Practices de mentenanță BD (10yo DBA Checklist):
- **Adăugări de coloane noi:** Fă-le mereu opționale `coloanaNoua String?` la primul deploy, sau oferă o valoare `@default("ceva")`. Acest lucru previne excepțiile "NOT NULL constraint failed" pe înregistrările istorice deja existente.
- **Redenumirea coloanelor:** NU redenumi direct parametrul în `schema.prisma`. Adaugă instrucțiunea `@map("vechiul_nume")` pentru linia nouă, apoi folosește flag-ul de `--create-only` în terminal pentru a scrie manual scriptul SQL de tip `ALTER TABLE RENAME COLUMN...` înainte ca ORM-ul să arunce tripticul *DROP/CREATE*.
- **Backups:** Asigură-te că ai un script de `pg_dump` programat (cron) pe volumul de Docker (`postgres_data`) înainte de orice push major în consolă.

---

## 🚀 Rularea Proiectului

### Local Development
```bash
npm install
npm run dev
# Deschide http://localhost:3000
```

### Producție (Via Docker)
Construirea imaginii și atașarea volumelor de baze de date (în rețea izolată TCP):
```bash
docker compose up -d --build
```
Loguri în timp real:
```bash
docker compose logs -f app
```
Aplicația Dockerizată va răspunde pe `http://localhost:3001` (conform mapping-ului docker-compose.yml) fără să altereze porturile locale!
