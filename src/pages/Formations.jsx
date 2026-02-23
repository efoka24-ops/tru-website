import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Clock, 
  MapPin, 
  DollarSign, 
  Users,
  Calendar,
  CheckCircle,
  Monitor,
  BookOpen,
  X
} from 'lucide-react';
import { Button } from '../components/Button';

export default function Formations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [showInscriptionModal, setShowInscriptionModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    profession: '',
    entreprise: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [inscriptionResult, setInscriptionResult] = useState(null);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/formations`);
      const data = await response.json();
      setFormations(data.filter(f => f.statut === 'active'));
    } catch (error) {
      console.error('Erreur chargement formations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInscrire = (formation) => {
    setSelectedFormation(formation);
    setShowInscriptionModal(true);
    setInscriptionResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/inscriptions-formations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          formation_id: selectedFormation.id
        })
      });

      const data = await response.json();
      
      setInscriptionResult(data);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        profession: '',
        entreprise: ''
      });
    } catch (error) {
      console.error('Erreur inscription:', error);
      alert('Erreur lors de l\'inscription');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadFiche = async (inscription) => {
    const formation = inscription.formations || {};
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    let formationDetails = formation;
    if (!formationDetails?.categorie && !formationDetails?.category) {
      if (selectedFormation?.categorie || selectedFormation?.category) {
        formationDetails = selectedFormation;
      } else if (inscription.formation_id) {
        try {
          const response = await fetch(`${apiUrl}/api/formations/${inscription.formation_id}`);
          if (response.ok) {
            formationDetails = await response.json();
          }
        } catch (error) {
          console.warn('Formation fetch failed:', error);
        }
      }
    }

    const formationData = formationDetails || formation;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const brandGreen = [22, 163, 74];
    const slate = [15, 23, 42];
    const lightGray = [241, 245, 249];

    const cleanText = (value) => {
      return (value ?? '-')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    const formatMoney = (value) => {
      const num = Number(value || 0);
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    doc.setFillColor(20, 83, 45);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('TRU GROUP', margin, 18);
    doc.setFontSize(11);
    doc.text("RECU D'INSCRIPTION - FORMATION", pageWidth - margin, 18, { align: 'right' });

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.text(`Emis le: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, 24, { align: 'right' });

    const card = (x, y, w, h, fill = lightGray) => {
      doc.setFillColor(...fill);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, y, w, h, 3, 3, 'FD');
    };

    const sectionTitle = (title, x, y) => {
      doc.setTextColor(...slate);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(cleanText(title), x, y);
    };

    const field = (label, value, x, y, maxWidth) => {
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(cleanText(label), x, y);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      const lines = doc.splitTextToSize(cleanText(value), maxWidth);
      doc.text(lines, x, y + 5);
      return y + 5 + lines.length * 4.5;
    };

    const yStart = 36;
    const halfWidth = (contentWidth - 4) / 2;
    card(margin, yStart, halfWidth, 22, [255, 255, 255]);
    card(margin + halfWidth + 4, yStart, halfWidth, 22, [255, 255, 255]);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Numero inscription', margin + 6, yStart + 8);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(cleanText(inscription.numero_inscription), margin + 6, yStart + 15);

    const status = inscription.statut === 'confirmee' ? 'Confirmee' : 'En attente';
    const statusWidth = doc.getTextWidth(status) + 10;
    const statusX = margin + halfWidth + 4 + halfWidth - statusWidth - 6;
    doc.setFillColor(...brandGreen);
    doc.roundedRect(statusX, yStart + 7, statusWidth, 8, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(status, statusX + statusWidth / 2, yStart + 13, { align: 'center' });

    let y = yStart + 30;

    card(margin, y, contentWidth, 40, [255, 255, 255]);
    sectionTitle('Participant', margin + 6, y + 8);

    const colGap = 8;
    const colWidth = (contentWidth - colGap) / 2;
    const colLeft = margin + 6;
    const colRight = margin + 6 + colWidth + colGap;

    let leftY = y + 14;
    let rightY = y + 14;

    leftY = field('Nom', inscription.nom, colLeft, leftY, colWidth - 2);
    rightY = field('Prenom', inscription.prenom, colRight, rightY, colWidth - 2);
    leftY = field('Email', inscription.email, colLeft, leftY + 2, colWidth - 2);
    rightY = field('Telephone', inscription.telephone, colRight, rightY + 2, colWidth - 2);
    leftY = field('Entreprise', inscription.entreprise, colLeft, leftY + 2, colWidth - 2);
    rightY = field('Profession', inscription.profession, colRight, rightY + 2, colWidth - 2);

    y += 50;

    const titleText = `Titre: ${cleanText(formationData.titre || '-')}`;
    const titleLines = doc.splitTextToSize(titleText, contentWidth - 20);
    const lineHeight = 4.5;
    const formationCardHeight = 46 + Math.max(0, titleLines.length - 1) * lineHeight;

    card(margin, y, contentWidth, formationCardHeight, [255, 255, 255]);
    sectionTitle('Formation', margin + 6, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(titleLines, margin + 6, y + 16);

    const categorieLabel =
      formationData.categorie ||
      formationData.category ||
      selectedFormation?.categorie ||
      selectedFormation?.category ||
      'Non defini';
    const categorieY = y + 16 + titleLines.length * lineHeight + 2;
    doc.text(`Categorie: ${cleanText(categorieLabel)}`, margin + 6, categorieY);

    const detailsY = categorieY + 8;
    doc.text(`Duree: ${cleanText(formationData.duree)}`, margin + 6, detailsY);
    doc.text(`Format: ${cleanText(formationData.format)}`, margin + 70, detailsY);
    doc.text(`Lieu: ${cleanText(formationData.lieu)}`, margin + 120, detailsY, { maxWidth: 50 });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...brandGreen);
    doc.text(`${formatMoney(formationData.prix)} FCFA`, pageWidth - margin - 6, y + 24, { align: 'right' });

    y += formationCardHeight + 8;

    card(margin, y, contentWidth, 26, lightGray);
    sectionTitle('Resume paiement', margin + 6, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Montant: ${formatMoney(formationData.prix)} FCFA`, margin + 6, y + 16);
    doc.text('Mode: Mobile Money / Virement / Especes', margin + 70, y + 16);

    y += 34;

    card(margin, y, 40, 40, [255, 255, 255]);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('QR', margin + 20, y + 22, { align: 'center' });

    doc.setTextColor(...slate);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Merci pour votre confiance.', margin + 48, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Contact: contact@trugroup.cm', margin + 48, y + 24);
    doc.text('Site: www.trugroup.cm', margin + 48, y + 31);

    const footerY = pageHeight - 28;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Cachet officiel', margin, footerY + 8);
    doc.text('Signature', pageWidth - margin, footerY + 8, { align: 'right' });

    doc.save(`recu-inscription-${inscription.numero_inscription}.pdf`);
  };

  const formatPrice = (price) => {
    return Number(price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-20">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 font-medium mb-6">
            <GraduationCap className="w-5 h-5" />
            Formations Professionnelles
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Développez vos <span className="text-green-600">Compétences</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Formations certifiantes en Digital, DevOps, Data Science et plus encore. 
            Animées par des experts de TRU GROUP.
          </p>
        </motion.div>
      </div>

      {/* Formations Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {formations.map((formation, index) => (
            <motion.div
              key={formation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 relative overflow-hidden">
                {formation.image_url ? (
                  <img 
                    src={formation.image_url} 
                    alt={formation.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GraduationCap className="w-20 h-20 text-white opacity-30" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {formation.titre}
                </h3>
                
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {formation.description}
                </p>

                {/* Infos */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>{formation.duree}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    {formation.format === 'en_ligne' ? (
                      <>
                        <Monitor className="w-4 h-4 text-green-600" />
                        <span>Formation en ligne</span>
                      </>
                    ) : formation.format === 'presentiel' ? (
                      <>
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{formation.lieu}</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <span>Hybride</span>
                      </>
                    )}
                  </div>

                  {formation.date_debut && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span>Début: {formatDate(formation.date_debut)}</span>
                    </div>
                  )}

                  {formation.places_disponibles && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4 text-green-600" />
                      <span>{formation.places_disponibles} places restantes</span>
                    </div>
                  )}
                </div>

                {/* Modules */}
                {formation.modules && formation.modules.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-900 mb-2">Modules:</p>
                    <div className="flex flex-wrap gap-1">
                      {formation.modules.slice(0, 3).map((module, i) => (
                        <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {module}
                        </span>
                      ))}
                      {formation.modules.length > 3 && (
                        <span className="text-xs text-slate-500">
                          +{formation.modules.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Prix & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(formation.prix)} <span className="text-sm">FCFA</span>
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleInscrire(formation)}
                    size="sm"
                    className="rounded-full"
                  >
                    S'inscrire
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal Inscription */}
      <AnimatePresence>
        {showInscriptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowInscriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Inscription
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedFormation?.titre}
                  </p>
                </div>
                <button
                  onClick={() => setShowInscriptionModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {!inscriptionResult ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Nom *</label>
                        <input
                          type="text"
                          required
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Prénoms *</label>
                        <input
                          type="text"
                          required
                          value={formData.prenom}
                          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Téléphone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Profession</label>
                        <input
                          type="text"
                          value={formData.profession}
                          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Entreprise</label>
                        <input
                          type="text"
                          value={formData.entreprise}
                          onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-full py-4"
                    >
                      {submitting ? 'Inscription en cours...' : 'Valider l\'inscription'}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      Inscription réussie!
                    </h3>
                    
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                      <p className="text-sm text-slate-600 mb-2">Votre numéro d'inscription:</p>
                      <p className="text-3xl font-bold text-green-600 mb-4">
                        {inscriptionResult.numero_inscription}
                      </p>
                      <p className="text-xs text-slate-500">
                        Conservez précieusement ce numéro
                      </p>
                    </div>

                    <Button
                      onClick={() => downloadFiche(inscriptionResult)}
                      className="w-full rounded-full mb-4"
                    >
                      📄 Télécharger le recu PDF
                    </Button>

                    <div className="text-left bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                      <p className="font-semibold mb-2">Prochaines étapes:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Téléchargez votre fiche d'inscription</li>
                        <li>Effectuez le paiement ({formatPrice(selectedFormation.prix)} FCFA)</li>
                        <li>Revenez confirmer votre paiement avec votre numéro</li>
                      </ol>
                    </div>

                    <button
                      onClick={() => setShowInscriptionModal(false)}
                      className="mt-4 text-slate-600 hover:text-slate-900"
                    >
                      Fermer
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
