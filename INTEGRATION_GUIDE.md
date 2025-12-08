// GUIDE D'INTÉGRATION - TeamSection

// ============================================
// 1. IMPORTER ET UTILISER DANS UNE PAGE
// ============================================

import { TeamSection } from '@/components/TeamSection';

export function HomePage() {
  return (
    <main>
      <header>
        <h1>Bienvenue sur TRU GROUP</h1>
      </header>

      {/* Insérer simplement la section équipe */}
      <TeamSection />

      <footer>
        <p>© 2024 TRU GROUP</p>
      </footer>
    </main>
  );
}

// ============================================
// 2. UTILISER L'API DIRECTEMENT
// ============================================

import { 
  getTeamMembers, 
  getFounders, 
  getVisibleTeamMembers,
  getTeamStats 
} from '@/api/teamApi';

// Dans un composant
export function TeamStats() {
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const teamStats = await getTeamStats();
      setStats(teamStats);
    })();
  }, []);

  if (!stats) return <div>Chargement...</div>;

  return (
    <div className="stats-grid">
      <div>Total: {stats.total} membres</div>
      <div>Visibles: {stats.visible} membres</div>
      <div>Fondateurs: {stats.founders}</div>
      <div>Compétences: {stats.expertise_tags} tags</div>
      <div>Réalisations: {stats.achievements_tags} tags</div>
    </div>
  );
}

// ============================================
// 3. AFFICHER LES FONDATEURS SEULEMENT
// ============================================

import { useQuery } from '@tanstack/react-query';
import { getFounders } from '@/api/teamApi';

export function FoundersSection() {
  const { data: founders = [], isLoading } = useQuery({
    queryKey: ['founders'],
    queryFn: getFounders,
  });

  return (
    <section className="py-12 bg-amber-50">
      <h2>Les Fondateurs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2">
        {founders.map(founder => (
          <div key={founder.id} className="bg-white p-6 rounded-lg">
            <h3>{founder.name}</h3>
            <p>{founder.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================
// 4. PERSONNALISER LE COMPOSANT
// ============================================

// Créer une version personnalisée
import { useQuery } from '@tanstack/react-query';
import { getTeamMembers } from '@/api/teamApi';
import { motion } from 'framer-motion';

export function CustomTeamGrid({ columns = 3, maxMembers = undefined }) {
  const { data: allMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
  });

  const members = maxMembers ? allMembers.slice(0, maxMembers) : allMembers;
  const visibleMembers = members.filter(m => m.is_visible !== false);

  return (
    <motion.div
      layout
      className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}
    >
      {visibleMembers.map(member => (
        <motion.div
          key={member.id}
          layout
          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          {/* Photo */}
          <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600">
            {member.photo_url ? (
              <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-bold text-lg">{member.name}</h3>
            <p className="text-sm text-gray-600">{member.role}</p>
            {member.description && <p className="text-xs text-gray-500 mt-2">{member.description}</p>}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Utilisation
<CustomTeamGrid columns={2} maxMembers={6} />

// ============================================
// 5. AFFICHER UN MEMBRE SPÉCIFIQUE
// ============================================

import { useParams } from 'react-router-dom';
import { getTeamMember } from '@/api/teamApi';
import { useQuery } from '@tanstack/react-query';

export function MemberDetailPage() {
  const { memberId } = useParams();

  const { data: member, isLoading } = useQuery({
    queryKey: ['teamMember', memberId],
    queryFn: () => getTeamMember(memberId),
  });

  if (isLoading) return <div>Chargement...</div>;
  if (!member) return <div>Membre non trouvé</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Photo grande */}
        <div className="w-full h-96 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          {member.photo_url ? (
            <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-white text-8xl font-bold">
              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2">{member.name}</h1>
          <p className="text-xl text-emerald-600 font-semibold mb-4">{member.role}</p>

          {member.is_founder && (
            <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-semibold mb-4">
              Fondateur de TRU GROUP
            </span>
          )}

          {member.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">À propos</h2>
              <p className="text-gray-700">{member.description}</p>
            </div>
          )}

          {/* Expertise */}
          {member.expertise?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {member.expertise.map((exp, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Réalisations */}
          {member.achievements?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Réalisations</h2>
              <ul className="space-y-2">
                {member.achievements.map((achievement, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <div className="space-y-2">
              {member.email && (
                <a href={`mailto:${member.email}`} className="text-emerald-600 hover:underline">
                  📧 {member.email}
                </a>
              )}
              {member.phone && (
                <a href={`tel:${member.phone}`} className="block text-emerald-600 hover:underline">
                  📱 {member.phone}
                </a>
              )}
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="block text-emerald-600 hover:underline">
                  💼 Profil LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 6. AJOUTER À PLUSIEURS PAGES
// ============================================

// Dans src/pages/About.jsx
import { TeamSection } from '@/components/TeamSection';

export function AboutPage() {
  return (
    <div>
      <h1>À propos de TRU GROUP</h1>
      <p>Nous sommes une équipe de passionnés...</p>
      
      <TeamSection />
    </div>
  );
}

// Dans src/pages/Services.jsx
import { FoundersSection } from '@/components/FoundersSection';
import { TeamSection } from '@/components/TeamSection';

export function ServicesPage() {
  return (
    <div>
      <h1>Nos Services</h1>
      
      <FoundersSection />
      <TeamSection />
    </div>
  );
}

// ============================================
// 7. STYLING PERSONNALISÉ
// ============================================

// Utiliser CSS modules ou Tailwind classes
export function StyledTeamSection() {
  return (
    <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-5xl font-bold text-white text-center mb-4"
        >
          Notre Équipe d'Experts
        </motion.h2>
        
        <p className="text-center text-slate-300 mb-12 max-w-2xl mx-auto">
          Découvrez les talents qui font TRU GROUP
        </p>

        <TeamSection />
      </div>
    </section>
  );
}

// ============================================
// 8. DEBUGGING - VÉRIFIER LA SYNCHRONISATION
// ============================================

// Dans la console du navigateur:

// Récupérer les données manuellement
import { getTeamMembers } from '@/api/teamApi';
const members = await getTeamMembers();
console.log('Membres:', members);

// Voir la configuration API
import { getAPIConfig } from '@/config/apiConfig';
console.log('Config:', getAPIConfig());

// Vérifier les URLs
import { getTeamApiUrl } from '@/config/apiConfig';
console.log('Backoffice:', getTeamApiUrl('backoffice'));
console.log('Admin:', getTeamApiUrl('admin'));
console.log('Site:', getTeamApiUrl('site'));

// ============================================
// 9. OPTIMIZATION - MÉMORISATION
// ============================================

import React from 'react';

// Mémoriser le composant pour éviter re-renders inutiles
export const MemoizedTeamSection = React.memo(() => {
  return <TeamSection />;
});

// Dans votre page
export function PageWithMemoizedTeam() {
  return (
    <div>
      <MemoizedTeamSection />
    </div>
  );
}

// ============================================
// 10. ERREURS COURANTES
// ============================================

// ❌ MAUVAIS - Import incorrect
import TeamSection from '@/TeamSection';

// ✅ BON - Import correct
import { TeamSection } from '@/components/TeamSection';

// ❌ MAUVAIS - Oublier l'async/await
const members = getTeamMembers(); // undefined

// ✅ BON - Utiliser async/await
const members = await getTeamMembers(); // Array

// ❌ MAUVAIS - Appel API en render sans useQuery
function Component() {
  const data = getTeamMembers(); // API appelée à chaque render!
  return <div>{data}</div>;
}

// ✅ BON - Utiliser useQuery
function Component() {
  const { data } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
  });
  return <div>{data}</div>;
}

// ============================================
// FIN DU GUIDE
// ============================================
