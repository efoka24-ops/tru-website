# Configuration pour déploiement sur Vercel/Netlify

## Frontend (Vercel)

1. Connectez-vous à vercel.com
2. Import depuis GitHub : https://github.com/efoka24-ops/tru-website
3. Framework : Vite
4. Build Command : `npm run build`
5. Output Directory : `dist`

## Backend (Railway ou Render)

1. Connectez-vous à railway.app ou render.com
2. Créez un nouveau Service
3. Connectez votre dépôt GitHub
4. Root Directory : `backend`
5. Start Command : `npm run dev`
6. Environment variables :
   - PORT=5000
   - NODE_ENV=production

## Back Office (Vercel ou Netlify)

1. Connectez-vous à vercel.com ou netlify.com
2. Import depuis GitHub
3. Root Directory : `backoffice`
4. Build Command : `npm run build`
5. Output Directory : `dist`
6. Environment variables :
   - VITE_API_URL=https://your-backend-url/api
