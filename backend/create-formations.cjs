/**
 * Script pour créer toutes les formations TRU GROUP (CommonJS)
 * Exécuter avec: node create-formations.cjs
 */

const API_URL = 'http://localhost:5000/api';

// Formations - Compétences (10 formations)
const competencesFormations = [
  {
    titre: "Intelligence Artificielle (IA)",
    description: "Maîtrisez les fondamentaux de l'IA, du Machine Learning au Deep Learning. Apprenez à créer des modèles intelligents et à les déployer en production.",
    prix: 580000,
    duree: "8 semaines",
    format: "hybride",
    lieu: "Yaoundé / En ligne",
    modules: ["Introduction à l'IA", "Machine Learning fondamental", "Deep Learning et réseaux de neurones", "NLP (Traitement du langage naturel)", "Computer Vision", "Projet final IA"],
    places_disponibles: 25,
    statut: "active",
    date_debut: "2026-03-10",
    date_fin: "2026-05-05"
  },
  {
    titre: "Cybersécurité",
    description: "Protégez les systèmes informatiques contre les menaces. Apprenez les techniques de hacking éthique, la sécurité réseau et la gestion des incidents.",
    prix: 480000,
    duree: "6 semaines",
    format: "presentiel",
    lieu: "Douala, Cameroun",
    modules: ["Fondamentaux de la cybersécurité", "Sécurité des réseaux", "Cryptographie", "Ethical Hacking", "Gestion des incidents", "Conformité et normes ISO"],
    places_disponibles: 20,
    statut: "active",
    date_debut: "2026-03-17",
    date_fin: "2026-04-28"
  },
  {
    titre: "Analyse des Données",
    description: "Devenez expert en analyse de données. Maîtrisez SQL, Python, la visualisation et l'interprétation des données pour prendre des décisions stratégiques.",
    prix: 420000,
    duree: "5 semaines",
    format: "en_ligne",
    lieu: "Formation en ligne",
    modules: ["SQL pour l'analyse", "Python pour Data Analysts", "Excel avancé", "Visualisation avec Tableau", "Statistiques descriptives", "Storytelling avec les données"],
    places_disponibles: 30,
    statut: "active",
    date_debut: "2026-03-15",
    date_fin: "2026-04-19"
  },
  {
    titre: "Marketing Numérique",
    description: "Maîtrisez les stratégies de marketing digital. SEO, publicité en ligne, réseaux sociaux, email marketing et analytics pour booster votre business.",
    prix: 380000,
    duree: "4 semaines",
    format: "hybride",
    lieu: "Yaoundé / En ligne",
    modules: ["Fondamentaux du marketing digital", "SEO et référencement", "Google Ads et Facebook Ads", "Réseaux sociaux et content marketing", "Email marketing", "Analytics et mesure de performance"],
    places_disponibles: 25,
    statut: "active",
    date_debut: "2026-03-20",
    date_fin: "2026-04-17"
  },
  {
    titre: "Anglais des Affaires",
    description: "Améliorez votre anglais professionnel. Communication d'entreprise, présentations, négociations et rédaction de documents professionnels.",
    prix: 320000,
    duree: "8 semaines",
    format: "presentiel",
    lieu: "Yaoundé, Cameroun",
    modules: ["Business vocabulary", "Présentations professionnelles", "Email et rédaction", "Réunions et conférences", "Négociation", "Certification TOEIC"],
    places_disponibles: 15,
    statut: "active",
    date_debut: "2026-03-12",
    date_fin: "2026-05-07"
  },
  {
    titre: "IA Générative (GenAI)",
    description: "Explorez les modèles génératifs comme ChatGPT, Midjourney et Stable Diffusion. Créez du contenu avec l'IA et automatisez vos workflows.",
    prix: 450000,
    duree: "4 semaines",
    format: "en_ligne",
    lieu: "Formation en ligne",
    modules: ["Introduction à l'IA générative", "Prompt Engineering", "ChatGPT et GPT-4", "Génération d'images (Midjourney, DALL-E)", "Automatisation avec l'IA", "Éthique et meilleures pratiques"],
    places_disponibles: 30,
    statut: "active",
    date_debut: "2026-03-25",
    date_fin: "2026-04-22"
  },
  {
    titre: "Microsoft Excel Avancé",
    description: "Maîtrisez Excel de A à Z. Formules avancées, tableaux croisés dynamiques, macros VBA et Power Query pour l'analyse de données.",
    prix: 280000,
    duree: "3 semaines",
    format: "hybride",
    lieu: "Douala / En ligne",
    modules: ["Formules et fonctions avancées", "Tableaux croisés dynamiques", "Graphiques et visualisations", "Power Query", "Macros et VBA", "Dashboard Excel"],
    places_disponibles: 25,
    statut: "active",
    date_debut: "2026-03-18",
    date_fin: "2026-04-08"
  },
  {
    titre: "Microsoft Power BI",
    description: "Créez des tableaux de bord interactifs avec Power BI. DAX, modélisation de données et visualisations avancées pour la Business Intelligence.",
    prix: 380000,
    duree: "4 semaines",
    format: "presentiel",
    lieu: "Yaoundé, Cameroun",
    modules: ["Introduction à Power BI", "Connexion aux données", "Modélisation et relations", "DAX (Data Analysis Expressions)", "Visualisations avancées", "Publication et partage"],
    places_disponibles: 20,
    statut: "active",
    date_debut: "2026-03-22",
    date_fin: "2026-04-19"
  },
  {
    titre: "Gestion de Projet (Project Management)",
    description: "Apprenez les meilleures pratiques de gestion de projet. Méthodologies Agile, Scrum, gestion des risques et préparation à la certification PMP.",
    prix: 420000,
    duree: "5 semaines",
    format: "hybride",
    lieu: "Yaoundé / En ligne",
    modules: ["Fondamentaux de la gestion de projet", "Méthodologies Agile et Scrum", "Planification et suivi", "Gestion des risques", "Leadership d'équipe", "Préparation certification PMP"],
    places_disponibles: 20,
    statut: "active",
    date_debut: "2026-03-24",
    date_fin: "2026-04-28"
  },
  {
    titre: "Python pour Débutants et Professionnels",
    description: "Apprenez Python de zéro à expert. Programmation, automatisation, analyse de données et développement web avec Python.",
    prix: 380000,
    duree: "6 semaines",
    format: "en_ligne",
    lieu: "Formation en ligne",
    modules: ["Bases de Python", "Programmation orientée objet", "Manipulation de fichiers", "Pandas et NumPy", "Automatisation avec Python", "Projets pratiques"],
    places_disponibles: 35,
    statut: "active",
    date_debut: "2026-03-16",
    date_fin: "2026-04-27"
  }
];

// Certificats et Programmes (10 formations)
const certificatsFormations = [
  {
    titre: "Certificat de Cybersécurité Google",
    description: "Programme complet de certification Google en cybersécurité. Préparez-vous à une carrière en sécurité informatique avec un certificat reconnu mondialement.",
    prix: 650000,
    duree: "6 mois",
    format: "en_ligne",
    lieu: "Formation en ligne",
    modules: ["Fondamentaux de la cybersécurité", "Sécurité des réseaux et systèmes", "Détection et réponse aux incidents", "Python pour la cybersécurité", "Gestion des actifs et menaces", "Examen de certification Google"],
    places_disponibles: 25,
    statut: "active",
    date_debut: "2026-04-01",
    date_fin: "2026-09-30"
  },
  {
    titre: "Certificat Google Data Analytics",
    description: "Devenez analyste de données certifié Google. Apprenez SQL, R, Tableau et les compétences essentielles pour analyser les données.",
    prix: 620000,
    duree: "6 mois",
    format: "en_ligne",
    lieu: "Formation en ligne",
    modules: ["Fondamentaux de l'analyse de données", "Nettoyage et préparation des données", "SQL pour l'analyse", "Visualisation avec Tableau", "Programmation R", "Projet Capstone et certification"],
    places_disponibles: 30,
    statut: "active",
    date_debut: "2026-04-05",
    date_fin: "2026-10-05"
  },
  {
    titre: "Certificat d'Assistance Informatique Google",
    description: "Lancez votre carrière en support IT avec la certification Google. Apprenez le dépannage, la gestion des systèmes et le service client.",
    prix: 580000,
    duree: "5 mois",
    format: "hybride",
    lieu: "Yaoundé / En ligne",
    modules: ["Principes du support technique", "Réseaux informatiques", "Systèmes d'exploitation", "Administration système", "Sécurité IT", "Certification Google IT Support"],
    places_disponibles: 20,
    statut: "active",
    date_debut: "2026-04-10",
    date_fin: "2026-09-10"
  },
  {
    titre: "Certificat de Gestion de Projet Google",
    description: "Préparez-vous à gérer des projets avec le certificat Google. Méthodologies Agile, outils de gestion et compétences de leadership.",
    prix: 620000,
    duree: "6 mois",
    format: "en_ligne",
    lieu: "Formation en ligne",
    modules: ["Fondamentaux de la gestion de projet", "Initiation et planification", "Exécution et contrôle", "Méthodologie Agile", "Gestion des parties prenantes", "Certification Google Project Management"],
    places_disponibles: 25,
    statut: "active",
    date_debut: "2026-04-08",
    date_fin: "2026-10-08"
  },
  {
    titre: "Certificat Google UX Design",
    description: "Devenez designer UX certifié Google. Apprenez la recherche utilisateur, le prototypage, les wireframes et créez un portfolio professionnel.",
    prix: 650000,
    duree: "6 mois",
    format: "en_ligne",
    lieu: "Formation en ligne",
    modules: ["Fondamentaux du UX Design", "Recherche utilisateur", "Wireframes et prototypes", "Design haute fidélité", "Tests utilisateurs", "Portfolio et certification Google"],
    places_disponibles: 20,
    statut: "active",
    date_debut: "2026-04-12",
    date_fin: "2026-10-12"
  },
  {
    titre: "Certificat d'Analyste de Données IBM",
    description: "Programme de certification IBM en analyse de données. Python, SQL, visualisation et Machine Learning pour devenir Data Analyst.",
    prix: 680000,
    duree: "7 mois",
    format: "en_ligne",
    lieu: "Formation en ligne",
    modules: ["Introduction à l'analyse de données", "Python pour l'analyse", "Bases de données et SQL", "Visualisation avec Python", "Excel pour analysts", "Certification IBM Data Analyst"],
    places_disponibles: 25,
    statut: "active",
    date_debut: "2026-04-15",
    date_fin: "2026-11-15"
  },
  {
    titre: "Certificat IBM Science des Données",
    description: "Devenez Data Scientist certifié IBM. Machine Learning, Python, SQL et projets réels pour maîtriser la science des données.",
    prix: 750000,
    duree: "8 mois",
    format: "en_ligne",
    lieu: "Formation en ligne",
    modules: ["Méthodologie Data Science", "Python et bibliothèques (Pandas, NumPy)", "SQL et bases de données", "Machine Learning", "Deep Learning", "Projet Capstone IBM"],
    places_disponibles: 20,
    statut: "active",
    date_debut: "2026-04-20",
    date_fin: "2026-12-20"
  },
  {
    titre: "Certificat en Apprentissage Automatique",
    description: "Maîtrisez le Machine Learning de A à Z. Algorithmes, réseaux de neurones, NLP et Computer Vision avec des projets pratiques.",
    prix: 720000,
    duree: "7 mois",
    format: "hybride",
    lieu: "Yaoundé / En ligne",
    modules: ["Fondamentaux du Machine Learning", "Apprentissage supervisé", "Apprentissage non supervisé", "Deep Learning", "NLP et Computer Vision", "Projet final et certification"],
    places_disponibles: 15,
    statut: "active",
    date_debut: "2026-04-22",
    date_fin: "2026-11-22"
  },
  {
    titre: "Certificat Microsoft Power BI (Analyste Décisionnel)",
    description: "Certification officielle Microsoft Power BI. Devenez expert en Business Intelligence et créez des rapports professionnels.",
    prix: 580000,
    duree: "4 mois",
    format: "presentiel",
    lieu: "Douala, Cameroun",
    modules: ["Power BI Desktop", "Modélisation de données avancée", "DAX avancé", "Power Query", "Service Power BI", "Examen PL-300 Microsoft"],
    places_disponibles: 20,
    statut: "active",
    date_debut: "2026-04-25",
    date_fin: "2026-08-25"
  },
  {
    titre: "Certificat de Concepteur UI/UX",
    description: "Formation complète en design d'interface et expérience utilisateur. Figma, Adobe XD, recherche utilisateur et prototypage.",
    prix: 620000,
    duree: "5 mois",
    format: "hybride",
    lieu: "Yaoundé / En ligne",
    modules: ["Principes du design UI/UX", "Recherche et personas", "Wireframing et prototypage", "Design visuel et typographie", "Outils (Figma, Adobe XD)", "Portfolio et certification"],
    places_disponibles: 18,
    statut: "active",
    date_debut: "2026-04-28",
    date_fin: "2026-09-28"
  }
];

// Fonction pour créer une formation
async function createFormation(formation) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}/formations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formation)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log(`✅ ${formation.titre}`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur: ${formation.titre} - ${error.message}`);
    return null;
  }
}

// Fonction pour créer toutes les formations
async function createAllFormations() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   🎓 CRÉATION DES FORMATIONS TRU GROUP 🎓         ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  const total = competencesFormations.length + certificatsFormations.length;
  console.log(`📚 Total à créer: ${total} formations\n`);

  let successCount = 0;
  let errorCount = 0;

  // Créer les formations de compétences
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│  📖 COMPÉTENCES (10 formations)                 │');
  console.log('└─────────────────────────────────────────────────┘\n');
  
  for (const formation of competencesFormations) {
    const result = await createFormation(formation);
    if (result) successCount++;
    else errorCount++;
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n┌─────────────────────────────────────────────────┐');
  console.log('│  🎓 CERTIFICATS ET PROGRAMMES (10 formations)   │');
  console.log('└─────────────────────────────────────────────────┘\n');
  
  for (const formation of certificatsFormations) {
    const result = await createFormation(formation);
    if (result) successCount++;
    else errorCount++;
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Résumé final
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║              📊 RÉSUMÉ FINAL                       ║');
  console.log('╠════════════════════════════════════════════════════╣');
  console.log(`║  ✅ Succès:  ${successCount.toString().padEnd(38)} ║`);
  console.log(`║  ❌ Erreurs: ${errorCount.toString().padEnd(38)} ║`);
  console.log(`║  📊 Total:   ${(successCount + errorCount).toString().padEnd(38)} ║`);
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  if (successCount === total) {
    console.log('🎉 TOUTES LES FORMATIONS ONT ÉTÉ CRÉÉES AVEC SUCCÈS!\n');
  } else if (errorCount === total) {
    console.log('⚠️  AUCUNE FORMATION N\'A ÉTÉ CRÉÉE. Vérifiez que:\n');
    console.log('   1. Le backend tourne sur http://localhost:5000');
    console.log('   2. Les tables existent dans Supabase');
    console.log('   3. La connexion Supabase est configurée\n');
  } else {
    console.log('⚠️  CRÉATION PARTIELLE. Vérifiez les erreurs ci-dessus.\n');
  }
}

// Exécution
createAllFormations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
