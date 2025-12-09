import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/simpleClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, AlertCircle, Loader, Mail, MessageSquare } from 'lucide-react';

export default function ContactsPage() {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => apiClient.getContacts(),
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      showNotification('✅ Contact mis à jour!');
    },
    onError: (error) => {
      showNotification('❌ Erreur: ' + error.message, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDeleteConfirm(null);
      showNotification('✅ Contact supprimé!');
    },
    onError: (error) => {
      showNotification('❌ Erreur: ' + error.message, 'error');
    }
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredContacts = filterStatus === 'all'
    ? contacts
    : contacts.filter(c => c.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            💬 Gestion des Contacts
          </h1>
          <p className="text-slate-600 mt-2">Visualiser et gérer les messages de contact</p>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {['all', 'pending', 'replied', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-400'
              }`}
            >
              {status === 'all' ? '📋 Tous' : status === 'pending' ? '⏳ En attente' : status === 'replied' ? '✅ Répondus' : '🔒 Fermés'}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                notification.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}
            >
              {notification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <Check className="w-5 h-5 flex-shrink-0" />
              )}
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-slate-600 text-lg">Aucun contact</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-l-4 border-purple-500"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{contact.name}</h3>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          contact.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          contact.status === 'replied' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.status === 'pending' ? '⏳ En attente' : contact.status === 'replied' ? '✅ Répondu' : '🔒 Fermé'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 mb-3">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      {new Date(contact.submittedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" />
                      <p className="text-slate-700 flex-1">{contact.message}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    {contact.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateMutation.mutate({ id: contact.id, data: { status: 'replied' } })}
                          disabled={updateMutation.isPending}
                          className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 disabled:opacity-50"
                        >
                          ✅ Marquer comme répondu
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(contact.id)}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-semibold hover:bg-red-100 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4"
              >
                <h3 className="text-xl font-bold mb-4">Confirmer la suppression?</h3>
                <p className="text-slate-600 mb-6">Ce contact sera supprimé définitivement.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(deleteConfirm)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
