import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Search } from 'lucide-react';
import { Button } from '../components/Button';

export default function ConfirmerInscription() {
  const [numeroInscription, setNumeroInscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [inscription, setInscription] = useState(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!numeroInscription.trim()) {
      setError('Veuillez entrer un numéro d\'inscription');
      return;
    }

    setLoading(true);
    setError('');
    setInscription(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/inscriptions-formations/numero/${numeroInscription.trim()}`);
      
      if (!response.ok) {
        throw new Error('Inscription non trouvée');
      }

      const data = await response.json();
      setInscription(data);
    } catch (err) {
      setError('Numéro d\'inscription invalide ou introuvable');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!inscription) return;

    setConfirming(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/inscriptions-formations/confirmer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_inscription: numeroInscription.trim(),
          montant: inscription.formations.prix
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la confirmation');
      }

      const data = await response.json();
      setConfirmed(true);
      setInscription(data.inscription);
    } catch (err) {
      setError('Erreur lors de la confirmation. Veuillez réessayer.');
    } finally {
      setConfirming(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Confirmer mon <span className="text-green-600">Inscription</span>
          </h1>
          <p className="text-lg text-slate-600">
            Entrez votre numéro d'inscription pour confirmer votre paiement
          </p>
        </motion.div>

        {/* Search Form */}
        {!inscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-900">
                  Numéro d'inscription
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={numeroInscription}
                    onChange={(e) => setNumeroInscription(e.target.value)}
                    placeholder="FORM-2026-0001"
                    className="w-full px-4 py-4 pr-12 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-500 text-lg font-mono"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Format: FORM-ANNÉE-XXXX (ex: FORM-2026-0001)
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-4 text-lg"
              >
                {loading ? 'Recherche...' : 'Rechercher mon inscription'}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Inscription Details */}
        {inscription && !confirmed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Inscription trouvée
                  </h2>
                  <p className="text-slate-600">
                    Vérifiez les informations avant de confirmer
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  inscription.statut === 'confirmee' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {inscription.statut === 'confirmee' ? 'Confirmée' : 'En attente'}
                </div>
              </div>

              {inscription.statut === 'confirmee' && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <p className="text-green-700 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Cette inscription a déjà été confirmée le {formatDate(inscription.paiement_confirme_le)}
                  </p>
                </div>
              )}

              {/* Details */}
              <div className="space-y-4 mb-8">
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Numéro</p>
                    <p className="font-mono font-bold text-green-600">{inscription.numero_inscription}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Inscrit le</p>
                    <p className="font-semibold">{formatDate(inscription.created_at)}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-3">Formation</h3>
                  <p className="text-xl font-semibold text-green-600 mb-2">
                    {inscription.formations.titre}
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Durée:</span>{' '}
                      <span className="font-semibold">{inscription.formations.duree}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Format:</span>{' '}
                      <span className="font-semibold">{inscription.formations.format}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Prix:</span>{' '}
                      <span className="font-bold text-green-600">
                        {formatPrice(inscription.formations.prix)} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-3">Participant</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Nom:</span>{' '}
                      <span className="font-semibold">{inscription.nom} {inscription.prenom}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Email:</span>{' '}
                      <span className="font-semibold">{inscription.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Téléphone:</span>{' '}
                      <span className="font-semibold">{inscription.telephone}</span>
                    </div>
                    {inscription.profession && (
                      <div>
                        <span className="text-slate-600">Profession:</span>{' '}
                        <span className="font-semibold">{inscription.profession}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {inscription.statut !== 'confirmee' && (
                <div className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="w-full rounded-full py-4 text-lg"
                  >
                    {confirming ? 'Confirmation...' : 'Confirmer le paiement'}
                  </Button>

                  <button
                    onClick={() => {
                      setInscription(null);
                      setNumeroInscription('');
                      setError('');
                    }}
                    className="w-full text-slate-600 hover:text-slate-900 py-3"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Success Message */}
        {confirmed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Paiement confirmé!
            </h2>
            
            <p className="text-lg text-slate-600 mb-8">
              Votre inscription à la formation <strong>{inscription.formations.titre}</strong> est maintenant confirmée.
            </p>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
              <p className="text-sm text-slate-600 mb-2">Numéro d'inscription</p>
              <p className="text-2xl font-mono font-bold text-green-600">
                {inscription.numero_inscription}
              </p>
            </div>

            <div className="text-sm text-slate-600 mb-8">
              <p className="mb-2">Vous recevrez un email de confirmation sous peu avec:</p>
              <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                <li>Le programme détaillé de la formation</li>
                <li>Les modalités pratiques</li>
                <li>Le lien pour rejoindre la formation</li>
                <li>Les documents à préparer</li>
              </ul>
            </div>

            <Button
              onClick={() => {
                setConfirmed(false);
                setInscription(null);
                setNumeroInscription('');
              }}
              className="rounded-full px-12"
            >
              Nouvelle recherche
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
