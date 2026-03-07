# ⚙️ Instructions de Redéploiement Render

## Problème
Après un commit des changements du backend, Render doit redéployer l'application.

## Solution 1: Auto-redéploiement (Automatique)
- Render détecte automatiquement les changements pushés vers GitHub
- Peut prendre 1-5 minutes
- Vous recevrez une notification

## Solution 2: Force Redeploy (Manuel)
1. Aller sur https://dashboard.render.com
2. Sélectionner le service "tru-backend-o1zc"
3. Cliquer sur "Manual Deploy"
4. Cliquer sur "Deploy latest commit"
5. Attendre le message "Deploy successful"

## Vérification après redéploiement

```bash
# Tester l'endpoint GET
curl https://tru-backend-o1zc.onrender.com/api/contacts

# Tester le nouvel endpoint POST /reply
curl -X POST https://tru-backend-o1zc.onrender.com/api/contacts/reply \
  -H "Content-Type: application/json" \
  -d '{"id":1,"method":"email","message":"test"}'
```

## Logs du redéploiement
- Visible dans "Deploy Logs" du dashboard Render
- Chercher "Build in progress" → "Deploy in progress" → "Live"

## Troubleshooting

### Le redéploiement ne se lance pas
1. Vérifier que le code est bien pushé sur GitHub (`git push origin main`)
2. Vérifier le statut du repo sur GitHub
3. Vérifier les paramètres de webhook dans Render

### L'endpoint /reply retourne 404
1. Vérifier que le redéploiement est terminé ("Live" sur le dashboard)
2. Attendre 5 minutes après le redéploiement
3. Vider le cache du navigateur (Ctrl+Shift+Delete)

### Le service est "suspended"
1. Cliquer sur "Resume" sur le dashboard Render
2. Attendre le redéploiement
3. Tester l'API

## Status: ⏳ En attente de redéploiement Render

Les changements suivants sont en attente:
- ✅ Committés sur GitHub
- ⏳ En attente de redéploiement Render
- ⏳ À tester après redéploiement

Commits à vérifier:
- dfff535: "feat: Complete contact management system with email/SMS replies"
