# DentyMD — Ghid Deployment & Producție

## Cuprins
1. [Cerințe Sistem](#1-cerințe-sistem)
2. [Instalare Server Nou](#2-instalare-server-nou)
3. [Configurare Variabile de Mediu](#3-configurare-variabile-de-mediu)
4. [Setup Bază de Date](#4-setup-bază-de-date)
5. [Deploy cu Docker](#5-deploy-cu-docker)
6. [Deploy Manual (fără Docker)](#6-deploy-manual-fără-docker)
7. [Reverse Proxy & SSL](#7-reverse-proxy--ssl)
8. [Migrări Bază de Date](#8-migrări-bază-de-date)
9. [Update Aplicație (fără downtime)](#9-update-aplicație-fără-downtime)
10. [Backup & Restore](#10-backup--restore)
11. [CI/CD Pipeline](#11-cicd-pipeline)
12. [Monitorizare & Health Checks](#12-monitorizare--health-checks)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Cerințe Sistem

| Componentă | Versiune minimă |
|------------|----------------|
| Node.js | 20 LTS |
| PostgreSQL | 15+ (recomandat 17) |
| Docker | 24+ (opțional) |
| Docker Compose | v2+ (opțional) |
| Disk | 10 GB minim |
| RAM | 2 GB minim |

---

## 2. Instalare Server Nou

### 2.1 Cu Docker (Recomandat)

```bash
# 1. Clonează repo-ul
git clone <repo-url> /opt/dentymd
cd /opt/dentymd

# 2. Copiază și configurează variabilele de mediu
cp .env.example .env
nano .env  # Completează valorile reale

# 3. Build și pornire
docker compose up -d --build

# 4. Aplică migrările (prima dată)
docker compose exec app npx prisma migrate deploy

# 5. Seed date inițiale (opțional, prima dată)
docker compose exec app npx prisma db seed

# 6. Verifică
curl http://localhost:3001
```

### 2.2 Fără Docker

```bash
# 1. Instalează Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# 2. Instalează PostgreSQL
sudo apt install -y postgresql-17

# 3. Creează baza de date
sudo -u postgres psql -c "CREATE USER dentymd WITH PASSWORD 'parola-sigura';"
sudo -u postgres psql -c "CREATE DATABASE \"denty-app\" OWNER dentymd;"

# 4. Clonează și configurează
git clone <repo-url> /opt/dentymd
cd /opt/dentymd
cp .env.example .env
nano .env  # DATABASE_URL=postgresql://dentymd:parola-sigura@localhost:5432/denty-app?schema=public

# 5. Instalează dependențe și build
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build

# 6. Pornire cu PM2
npm install -g pm2
pm2 start npm --name "dentymd" -- start
pm2 save
pm2 startup
```

---

## 3. Configurare Variabile de Mediu

| Variabilă | Obligatorie | Descriere |
|-----------|------------|-----------|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL |
| `SESSION_SECRET` | ✅ | Cheie secretă sesiuni (min. 32 caractere) |
| `NODE_ENV` | ✅ | Hardcodat `production` în docker-compose |
| `POSTGRES_USER` | Docker | User PostgreSQL (docker-compose) |
| `POSTGRES_PASSWORD` | Docker | Parola PostgreSQL (docker-compose) |
| `POSTGRES_DB` | Docker | Numele bazei de date (docker-compose) |
| `NEXT_PUBLIC_SITE_URL` | Recomandat | URL public pentru sitemap/OG tags (default: `https://dentymd.md`) |
| `TELEGRAM_WEBHOOK_SECRET` | Opțional | Secret webhook Telegram (securizează `/api/telegram`) |
| `NEXT_PUBLIC_SENTRY_DSN` | Opțional | DSN Sentry pentru error tracking |
| `SEED_ADMIN_PASSWORD` | Seed | Parola admin la `prisma db seed` (default: `admin123`) |

> ⚠️ `SESSION_SECRET` și `DATABASE_URL` sunt obligatorii — `docker compose up` eșuează dacă lipsesc.

**Generare secrete:**
```bash
# SESSION_SECRET
openssl rand -hex 32

# TELEGRAM_WEBHOOK_SECRET
openssl rand -hex 24
```

---

## 4. Setup Bază de Date

### 4.1 Inițializare (prima dată)

```bash
# Aplică toate migrările
npx prisma migrate deploy

# Seed date inițiale (admin default, conținut demo)
npx prisma db seed
```

### 4.2 Verificare stare migrări

```bash
npx prisma migrate status
```

### 4.3 Conexiune la baza de date

```bash
# Via Docker
docker compose exec postgres psql -U postgres -d denty-app

# Direct
psql -h localhost -U dentymd -d denty-app
```

---

## 5. Deploy cu Docker

### 5.1 Pornire

```bash
# Build și pornire (detached)
docker compose up -d --build

# Verificare status
docker compose ps
docker compose logs -f app
```

### 5.2 Oprire

```bash
docker compose down          # Oprește containere (datele persistă)
docker compose down -v       # ⚠️ ATENȚIE: Șterge și volumele (inclusiv DB!)
```

### 5.3 Actualizare

```bash
# Pull cod nou
git pull origin main

# Rebuild și repornire
docker compose up -d --build

# Aplică migrări noi
docker compose exec app npx prisma migrate deploy
```

---

## 6. Deploy Manual (fără Docker)

```bash
cd /opt/dentymd
git pull origin main
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart dentymd
```

---

## 7. Reverse Proxy & SSL

### Nginx Config

```nginx
server {
    listen 80;
    server_name dentymd.ro www.dentymd.ro;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dentymd.ro www.dentymd.ro;

    ssl_certificate /etc/letsencrypt/live/dentymd.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dentymd.ro/privkey.pem;

    # Security headers (suplimentare la cele din Next.js)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Upload body size (matchează Next.js 50mb limit)
        client_max_body_size 50M;
    }
}
```

### SSL cu Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dentymd.ro -d www.dentymd.ro
# Auto-renewal este configurat automat
```

### Firewall

```bash
sudo ufw allow 22/tcp       # SSH
sudo ufw allow 80/tcp       # HTTP (redirect)
sudo ufw allow 443/tcp      # HTTPS
sudo ufw enable
# NU expune 5432 (PostgreSQL) sau 3001 (app intern)
```

---

## 8. Migrări Bază de Date

### 8.1 Workflow pentru modificări schema

```bash
# 1. Modifică prisma/schema.prisma
# 2. Generează migrare (doar pe development)
npx prisma migrate dev --name descriere_modificare

# 3. Verifică SQL generat
cat prisma/migrations/<timestamp>_descriere_modificare/migration.sql

# 4. Commit migrarea
git add prisma/migrations/ prisma/schema.prisma
git commit -m "migration: descriere_modificare"

# 5. Aplică pe producție
npx prisma migrate deploy
```

### 8.2 Reguli importante

- **NICIODATĂ** `prisma db push` pe producție
- **NICIODATĂ** `prisma migrate dev` pe producție
- **ÎNTOTDEAUNA** backup înainte de migrare
- **ÎNTOTDEAUNA** verifică SQL-ul generat înainte de commit
- Folosește `npx prisma migrate deploy` pe producție/staging

### 8.3 Rollback

Prisma nu are rollback automat. Strategia:

```bash
# 1. ÎNAINTE de migrare — creează backup
pg_dump -h localhost -U postgres denty-app > backup_pre_migration.sql

# 2. Dacă migrarea eșuează — restore din backup
psql -h localhost -U postgres denty-app < backup_pre_migration.sql

# 3. Marchează migrarea ca rolled back
npx prisma migrate resolve --rolled-back <migration_name>
```

Pentru rollback manual al unei migrări specifice, creează un script SQL invers:
```sql
-- Exemplu rollback: prisma/rollbacks/20260402000000_production_hardening.sql
-- Fiecare migrare ar trebui să aibă un rollback manual preparat

-- Revert indexes
DROP INDEX IF EXISTS "Lead_status_idx";
-- etc.

-- Revert Decimal → Float
ALTER TABLE "Service" ALTER COLUMN "price" TYPE DOUBLE PRECISION;
-- etc.
```

---

## 9. Update Aplicație (fără downtime)

### 9.1 Strategie zero-downtime

```bash
#!/bin/bash
# deploy.sh — Script de deployment sigur

set -e

echo "=== 1. Backup bază de date ==="
docker compose exec -T postgres pg_dump -U postgres denty-app > "backups/$(date +%Y%m%d_%H%M%S).sql"

echo "=== 2. Pull cod nou ==="
git pull origin main

echo "=== 3. Aplică migrări DB (înainte de app!) ==="
docker compose exec app npx prisma migrate deploy

echo "=== 4. Build imagine nouă ==="
docker compose build app

echo "=== 5. Rolling restart (minim downtime) ==="
docker compose up -d --no-deps app

echo "=== 6. Verificare health ==="
sleep 10
curl -sf http://localhost:3001/ > /dev/null && echo "✅ App OK" || echo "❌ App FAILED"

echo "=== Deploy complet ==="
```

### 9.2 Ordinea operațiilor (critică!)

1. **Backup DB** → obligatoriu înainte de orice
2. **Migrări DB** → aplică ÎNAINTE de update app (schema forward-compatible)
3. **Build app** → compilează codul nou
4. **Restart app** → pornește versiunea nouă
5. **Verificare** → confirmare că funcționează

### 9.3 Dacă ceva merge rău

```bash
# Revert la versiunea anterioară
git checkout <previous-commit>
docker compose up -d --build app

# Dacă și DB-ul e afectat
psql -h localhost -U postgres denty-app < backups/ultima_backup.sql
npx prisma migrate resolve --rolled-back <migration_name>
```

---

## 10. Backup & Restore

### 10.1 Backup manual

```bash
# Full dump
docker compose exec -T postgres pg_dump -U postgres -Fc denty-app > backup.dump

# SQL plain text
docker compose exec -T postgres pg_dump -U postgres denty-app > backup.sql
```

### 10.2 Backup automat (cron)

```bash
# Adaugă în crontab (crontab -e)
# Backup zilnic la 03:00, retenție 30 zile
0 3 * * * /opt/dentymd/scripts/backup.sh

# Backup săptămânal complet
0 4 * * 0 /opt/dentymd/scripts/backup-full.sh
```

Script backup:
```bash
#!/bin/bash
# scripts/backup.sh
BACKUP_DIR="/opt/backups/dentymd"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Dump baza de date
docker compose -f /opt/dentymd/docker-compose.yml exec -T postgres \
  pg_dump -U postgres -Fc denty-app > "$BACKUP_DIR/db_$TIMESTAMP.dump"

# Backup uploads
tar czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C /opt/dentymd src/app/image/ public/uploads/ 2>/dev/null || true

# Retenție 30 zile
find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "[$(date)] Backup completat: db_$TIMESTAMP.dump"
```

### 10.3 Restore

```bash
# Din dump custom format
docker compose exec -T postgres pg_restore -U postgres -d denty-app --clean --if-exists < backup.dump

# Din SQL plain text
docker compose exec -T postgres psql -U postgres -d denty-app < backup.sql

# Restore uploads
tar xzf uploads_TIMESTAMP.tar.gz -C /opt/dentymd/
```

### 10.4 Test restore (lunar)

```bash
# Creează BD temporară și restaurează
docker compose exec postgres createdb -U postgres denty-app-test
docker compose exec -T postgres pg_restore -U postgres -d denty-app-test < backup.dump
docker compose exec postgres dropdb -U postgres denty-app-test
```

---

## 11. CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx prisma generate
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: validate
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/dentymd
            bash scripts/deploy.sh
```

### Secrets necesare în GitHub

| Secret | Descriere |
|--------|-----------|
| `SERVER_HOST` | IP-ul sau hostname-ul serverului |
| `SERVER_USER` | Userul SSH (ex: deploy) |
| `SSH_PRIVATE_KEY` | Cheia SSH privată |

---

## 12. Monitorizare & Health Checks

### Health check endpoint

Aplicația răspunde la `GET /` cu status 200 dacă funcționează.

### Docker health checks

Docker Compose include health checks configurate:
- **App**: `wget --spider http://localhost:3000/` la fiecare 30s
- **PostgreSQL**: `pg_isready` la fiecare 10s

### Monitorizare externă (recomandat)

- [UptimeRobot](https://uptimerobot.com) — free, check HTTP la fiecare 5 min
- [Betterstack](https://betterstack.com) — status page + alerting

---

## 13. Troubleshooting

### Aplicația nu pornește

```bash
docker compose logs -f app            # Vezi logurile
docker compose exec app npx prisma migrate status  # Verifică migrări
docker compose restart app             # Repornire
```

### Probleme cu baza de date

```bash
docker compose exec postgres pg_isready -U postgres    # Check connection
docker compose logs postgres                           # Vezi loguri PostgreSQL
```

### Resetare completă (⚠️ pierde datele!)

```bash
docker compose down -v
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

### Port ocupat

```bash
lsof -i :3001    # Ce proces folosește portul
lsof -i :5432    # PostgreSQL
```
