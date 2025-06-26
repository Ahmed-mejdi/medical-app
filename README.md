# MediConnect

MediConnect est une plateforme moderne de gestion des soins et de communication médicale, destinée aux patients et aux professionnels de santé. Elle permet la gestion des rendez-vous, des ordonnances, des profils utilisateurs, la messagerie sécurisée, et bien plus.

## Fonctionnalités principales
- Authentification et gestion des rôles (patient, professionnel, admin)
- Tableau de bord personnalisé pour chaque rôle
- Gestion des patients, professionnels, rendez-vous et ordonnances
- Messagerie sécurisée entre patients et professionnels
- Notifications en temps réel
- Administration (gestion des utilisateurs)
- Pages d'aide, de paramètres, de profil, etc.

## Structure du projet
```
projet/
  client/      # Frontend Next.js (React, TypeScript, Tailwind)
  server/      # Backend Node.js (Express, PostgreSQL)
```

## Installation
### Prérequis
- Node.js >= 18
- PostgreSQL

### 1. Cloner le dépôt
```bash
git clone <url-du-repo>
cd projet
```

### 2. Installer les dépendances
```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 3. Configurer la base de données
- Créez une base PostgreSQL et configurez les variables d'environnement dans `server/.env` :
```
DB_USER=...
DB_PASSWORD=...
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mediconnect
CLIENT_URL=http://localhost:3000
```
- Exécutez les scripts SQL pour créer les tables (voir `server/database.sql` et `add_archived_column.sql`).

### 4. Lancer le backend
```bash
cd server
npm run dev
```

### 5. Lancer le frontend
```bash
cd client
npm run dev
```

Le frontend sera accessible sur [http://localhost:3000](http://localhost:3000) et le backend sur [http://localhost:5001](http://localhost:5001) (ou le port défini).

## Contribution
1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez vos modifications (`git commit -am 'Ajout d\'une fonctionnalité'`)
4. Poussez la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

## Auteurs
- Projet initial par [Votre Nom ou Organisation]

## Licence
Ce projet est sous licence MIT. 
