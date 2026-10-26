# Seben Notes

Bloc-notes intelligent : notes, écriture à la main, listes, rappels, PDF et exports (PDF, Word, PowerPoint).
« Seben » vient du bambara *sɛbɛn*, « écrire ».

## Installer

- **Android :** ouvrez la page [Releases](../../releases/latest) depuis votre téléphone, téléchargez `seben-notes.apk` et ouvrez-le. Android demande d'autoriser l'installation depuis votre navigateur la première fois.
- **Site web :** ouvrez le site GitHub Pages du dépôt, puis menu du navigateur → « Ajouter à l'écran d'accueil ». Il fonctionne aussi sans internet.

Hors de Claude, les notes sont enregistrées sur le téléphone. Pensez à faire une sauvegarde (Réglages → Avancés → Sauvegarder) avant de changer de téléphone.

## Comment c'est construit

- `src/seben-notes.html` : l'application complète, en un seul fichier (la même version que celle publiée dans Claude).
- `scripts/build.mjs` : crée `www/` (application autonome, bibliothèques copiées localement, fichiers hors ligne).
- `public/` : manifeste, icônes, service worker et `native.js` (partage de fichiers et bouton Retour sur Android).
- `.github/workflows/` : publication du site sur GitHub Pages et construction de l'APK Android (Capacitor) à chaque mise à jour de `main`.

Pour construire en local : `npm ci && npm run build`, puis `npx cap add android && npx cap sync android` pour Android.
