import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiClient } from '@/api/simpleClient';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [notification, setNotification] = useState(null);
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const response = await fetch('http://localhost:5000/api/settings');
        if (!response.ok) {
          return {
            id: 1,
            siteTitle: 'Site TRU',
            slogan: 'Transforming Reality Universally',
            tagline: 'Innovation & Solutions',
            email: 'contact@sitetru.com',
            phone: '+33 (0)1 00 00 00 00',
            address: '123 Rue de Paris, 75000 Paris',
            socialMedia: {
              facebook: '',
              twitter: '',
              linkedin: '',
              instagram: '',
            },
            businessHours: {
              monday: '09:00 - 18:00',
              tuesday: '09:00 - 18:00',
              wednesday: '09:00 - 18:00',
              thursday: '09:00 - 18:00',
              friday: '09:00 - 18:00',
              saturday: 'Fermé',
              sunday: 'Fermé',
            },
            primaryColor: '#10b981',
          };
        }
        return response.json();
      } catch (error) {
        console.error('Erreur chargement settings:', error);
        return null;
      }
    },
    staleTime: 60000,
  });

  useEffect(() => {
    if (fetchedSettings) {
      setSettings(fetchedSettings);
    }
  }, [fetchedSettings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      console.log('📤 Sauvegarde settings:', data);
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Erreur réponse:', error);
        throw new Error('Erreur sauvegarde: ' + error);
      }
      const result = await response.json();
      console.log('✅ Réponse serveur:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('✅ Mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      try {
        apiClient.notifyFrontend('update', 'settings', data);
      } catch (e) {
        console.warn('⚠️ Notification frontend échouée:', e);
      }
      showNotification('✅ Paramètres enregistrés avec succès!');
    },
    onError: (error) => {
      console.error('❌ Erreur mutation:', error);
      showNotification('❌ Erreur: ' + error.message, 'error');
    },
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!settings?.siteTitle || !settings?.email) {
      showNotification('Titre et Email sont obligatoires', 'error');
      return;
    }
    saveMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-slate-600">Erreur lors du chargement des paramètres</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">⚙️ Paramètres</h1>
          <p className="text-slate-600">Configurez votre site et informations</p>
        </div>

        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg font-semibold ${
              notification.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Section 1: Infos Générales */}
          <div className="border-b border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">📝 Informations Générales</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-900">
                  Titre du site *
                </label>
                <input
                  type="text"
                  value={settings.siteTitle || ''}
                  onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                  placeholder="Site TRU"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-900">
                  Slogan
                </label>
                <input
                  type="text"
                  value={settings.slogan || ''}
                  onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                  placeholder="Votre slogan"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 bg-slate-50"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-slate-900">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="Une brève description"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 bg-slate-50"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-slate-900">
                Couleur primaire
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={settings.primaryColor || '#10b981'}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={settings.primaryColor || '#10b981'}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  placeholder="#10b981"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 bg-slate-50 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Coordonnées */}
          <div className="border-b border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">📞 Coordonnées</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-900">
                  Email *
                </label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="contact@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-900">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+33 1 00 00 00 00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 bg-slate-50"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-slate-900">
                Adresse
              </label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="123 Rue de Paris, 75000 Paris"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Section 3: Réseaux Sociaux */}
          <div className="border-b border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">🌐 Réseaux Sociaux</h2>
            
            <div className="space-y-4">
              {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                <div key={social}>
                  <label className="block text-sm font-semibold mb-2 text-slate-900 capitalize">
                    {social}
                  </label>
                  <input
                    type="url"
                    value={settings.socialMedia?.[social] || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialMedia: {
                        ...settings.socialMedia,
                        [social]: e.target.value
                      }
                    })}
                    placeholder={`https://${social}.com/votreprofil`}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 bg-slate-50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Horaires */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">⏰ Horaires</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day}>
                  <label className="block text-sm font-semibold mb-2 text-slate-900 capitalize">
                    {day === 'monday' ? 'Lundi' :
                     day === 'tuesday' ? 'Mardi' :
                     day === 'wednesday' ? 'Mercredi' :
                     day === 'thursday' ? 'Jeudi' :
                     day === 'friday' ? 'Vendredi' :
                     day === 'saturday' ? 'Samedi' : 'Dimanche'}
                  </label>
                  <input
                    type="text"
                    value={settings.businessHours?.[day] || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      businessHours: {
                        ...settings.businessHours,
                        [day]: e.target.value
                      }
                    })}
                    placeholder="09:00 - 18:00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 bg-slate-50 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-200 p-8 bg-slate-50 flex gap-4">
            <button
              type="reset"
              onClick={() => setSettings(fetchedSettings)}
              className="flex-1 px-6 py-3 text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition-colors"
            >
              {saveMutation.isPending ? '⏳ Enregistrement...' : '💾 Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
