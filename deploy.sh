#!/bin/bash
# Script pour pousser le projet sur GitHub

echo "=== Poussée du projet TRU vers GitHub ==="

# Vérifier que git est configuré
git config user.email || git config --global user.email "efoka24ops@gmail.com"
git config user.name || git config --global user.name "Efoka Emmanuel"

# Ajouter les fichiers
echo "📦 Ajout des fichiers..."
git add .

# Vérifier s'il y a des changements
if git diff --cached --quiet; then
    echo "✅ Aucun changement à committer"
else
    # Créer le commit
    echo "📝 Création du commit..."
    git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Pousser vers GitHub
    echo "🚀 Poussée vers GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Succès ! Le projet a été poussé vers GitHub"
    else
        echo "❌ Erreur lors du push. Vérifiez votre authentification GitHub"
    fi
fi
