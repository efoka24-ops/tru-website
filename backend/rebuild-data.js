const fs = require('fs');

const data = {
  "users": [],
  "services": [],
  "content": [],
  "contacts": [],
  "team": [
    {
      "id": 1,
      "name": "Emmanuel Foka Ziegoube",
      "title": "Fondateur & PDG",
      "bio": "Ingénieur en génie logiciel | Lauréat CASAM-INOV, PNUD, ECAM Expert en transformation digitale et innovation sociale.",
      "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      "is_founder": true,
      "specialties": ["Stratégie", "Innovation", "Leadership"],
      "email": "emmanuel@trugroup.cm",
      "phone": "+237 678758976"
    },
    {
      "id": 2,
      "name": "Aissatou Diallo",
      "title": "Directrice Technique",
      "bio": "Ingénieure informatique avec 8 ans d'expérience en développement et architecture cloud.",
      "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      "is_founder": false,
      "specialties": ["Cloud", "Architecture", "DevOps"],
      "email": "aissatou@trugroup.cm",
      "phone": "+237 691234567"
    },
    {
      "id": 3,
      "name": "Jean Kameni",
      "title": "Consultant Transformation",
      "bio": "Consultant en organisation avec expertise dans les processus gouvernementaux et ONG.",
      "image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      "is_founder": false,
      "specialties": ["Organisation", "Processus", "Gouvernance"],
      "email": "jean@trugroup.cm",
      "phone": "+237 678901234"
    },
    {
      "id": 4,
      "name": "Marie Tagne",
      "title": "Lead Developer Mobile",
      "bio": "Développeuse mobile spécialisée en React Native et Flutter avec passion pour l'innovation.",
      "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      "is_founder": false,
      "specialties": ["Mobile", "React Native", "UX"],
      "email": "marie@trugroup.cm",
      "phone": "+237 695678901"
    },
    {
      "id": 5,
      "name": "Pierre Bouvier",
      "title": "Expert Data & Analytics",
      "bio": "Data scientist avec spécialisation en intelligence décisionnelle et machine learning.",
      "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      "is_founder": false,
      "specialties": ["Data Science", "BI", "Machine Learning"],
      "email": "pierre@trugroup.cm",
      "phone": "+237 676543210"
    }
  ]
};

// Remove old file if exists
if (fs.existsSync('./data.json')) {
  fs.unlinkSync('./data.json');
}

// Write new clean data
fs.writeFileSync('./data.json', JSON.stringify(data, null, 2), 'utf8');
console.log('✅ data.json recréé avec succès!');
