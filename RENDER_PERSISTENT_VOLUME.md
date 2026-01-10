# 🚀 Configuration Volume Persistant Render

## 📋 Résumé

Vos données `data.json` sont maintenant stockées dans un **volume persistant Render** :
- ✅ Les données restent même après redémarrages
- ✅ Aucune perte de données (plus besoin de GitHub backup)
- ✅ Configuration automatique via `render.yaml`

---

## 🔧 Comment ça marche

```
Redémarrage Render (tous les 15 min)
        ↓
server.js démarre
        ↓
Cherche DATA_FILE dans /var/data (volume persistant)
        ↓
Si existe → Utilise les données existantes ✅
Si n'existe pas → Initialise depuis data.example.json
        ↓
Modifications → Écrire dans /var/data/data.json (persiste)
```

---

## 📦 Configuration render.yaml

```yaml
disk:
  name: tru-data-volume      # Nom du volume
  mountPath: /var/data       # Où il est monté dans le conteneur
  sizeGB: 1                  # Taille (1 GB = 1000 fichiers JSON)

envVars:
  - key: DATA_DIR
    value: /var/data         # Notre code lit cette variable
```

---

## 🎯 Étapes de déploiement

### **1️⃣ Push les changements**
```bash
cd backend
git add render.yaml server.js
git commit -m "feat: Add persistent volume for data.json"
git push origin main
```

### **2️⃣ Redéployer sur Render**

Option A : **Automatic** (recommandé)
- Render détecte le push automatiquement
- Vérifie le `render.yaml`
- Redéploie avec le nouveau volume
- Attendre 2-3 min

Option B : **Manual**
1. Aller à: https://dashboard.render.com
2. Sélectionner: `tru-backend`
3. Cliquer: **"Manual Deploy"** ou **"Redeploy latest commit"**
4. Attendre les logs

### **3️⃣ Vérifier que le volume est attaché**

Regarder les logs Render:
```
✅ data.json trouvé dans le volume persistant
    ou
✅ data.json créé dans le volume persistant à partir de data.example.json
```

---

## ✅ Test de persistance

1. Modifiez un team member dans l'admin
2. Attendez 30 secondes (écriture dans data.json)
3. Allez sur Render Dashboard → Logs → cliquez **"Restart Instance"**
4. Attendez le redémarrage (30 sec)
5. Vérifiez la page admin → **les données sont toujours là ! ✨**

---

## 🛠️ Troubleshooting

### Problème: Les données disparaissent après redémarrage
**Solution:** 
- Vérifier les logs Render pour erreurs d'écriture
- Vérifier que `DATA_DIR=/var/data` est configuré dans Render dashboard

### Problème: "Permission denied" on /var/data
**Solution:**
- Le volume Render est automatiquement configuré
- Si erreur : aller à Service Settings → rebuild & redeploy

### Vouloir réinitialiser les données
```bash
# Sur le terminal Render, exécuter:
rm /var/data/data.json
# Puis redémarrer le service
```

---

## 📊 Prochaines étapes

✅ Données persistent → backend stable
→ Prochainement: Frontend affichera les données mises à jour

**Vos données sont maintenant 🔒 protégées!**
