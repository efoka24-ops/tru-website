import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamMembers, listenToTeamUpdates, notifyMemberViewed } from '@/api/teamApi';

/**
 * Composant pour afficher un membre de l'équipe
 */
const TeamMemberCard = ({ member }) => {
  useEffect(() => {
    // Notifier le backoffice que ce membre est affiché
    notifyMemberViewed(member);
  }, [member.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Photo */}
      <div className="aspect-square bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-5xl font-bold">
            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
          {member.is_founder && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
              Fondateur
            </span>
          )}
        </div>

        <p className="text-emerald-600 font-semibold text-sm mb-3">{member.role}</p>

        {member.description && (
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">{member.description}</p>
        )}

        {/* Expertise */}
        {member.expertise && member.expertise.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-700 mb-2">Expertise</p>
            <div className="flex flex-wrap gap-1">
              {member.expertise.slice(0, 3).map((exp, i) => (
                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  {exp}
                </span>
              ))}
              {member.expertise.length > 3 && (
                <span className="px-2 py-1 text-slate-600 text-xs">
                  +{member.expertise.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="flex gap-2">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              title="Envoyer un email"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              📧
            </a>
          )}
          {member.phone && (
            <a
              href={`tel:${member.phone}`}
              title="Appeler"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              📱
            </a>
          )}
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              title="Voir profil LinkedIn"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              💼
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Composant principal pour afficher l'équipe
 */
export const TeamSection = () => {
  const [updateNotification, setUpdateNotification] = useState(null);

  // Récupérer les données de l'équipe
  const { data: teamMembers = [], isLoading, refetch } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
    refetchInterval: 60000, // Refetch toutes les 60 secondes
    staleTime: 30000, // Les données sont considérées comme fraîches pendant 30 secondes
  });

  // Écouter les mises à jour en temps réel
  useEffect(() => {
    console.log('🔌 Connecting to team updates...');
    const unsubscribe = listenToTeamUpdates((update) => {
      if (update.action === 'sync' && update.members) {
        // Mise à jour de tous les membres
        console.log('🔄 Syncing team members:', update.members.length);
        refetch();
      } else {
        // Mise à jour individuelle
        console.log(`📡 Member ${update.action}:`, update.member?.name);
        setUpdateNotification({
          action: update.action,
          member: update.member?.name || 'Unknown',
          timestamp: new Date()
        });

        // Refetch les données
        refetch();

        // Masquer la notification après 3 secondes
        setTimeout(() => {
          setUpdateNotification(null);
        }, 3000);
      }
    });

    return unsubscribe;
  }, [refetch]);

  const visibleMembers = teamMembers.filter(m => m.is_visible !== false);

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Notre Équipe</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Rencontrez les experts passionnés qui dirigent TRU GROUP
          </p>
        </motion.div>

        {/* Update Notification */}
        <AnimatePresence>
          {updateNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900"
            >
              <p className="text-sm">
                📡 <strong>{updateNotification.member}</strong> a été {
                  updateNotification.action === 'create'
                    ? 'ajouté'
                    : updateNotification.action === 'update'
                    ? 'mis à jour'
                    : 'supprimé'
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Team Grid */}
        {!isLoading && visibleMembers.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {visibleMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && visibleMembers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-600">Aucun membre d'équipe disponible pour le moment.</p>
          </motion.div>
        )}

        {/* Sync Status */}
        <div className="mt-12 text-center text-xs text-slate-500">
          ✅ Données synchronisées en temps réel avec le backoffice
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
