import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Monitor, 
  Smartphone, 
  ClipboardCheck, 
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { apiService } from '../api/apiService';

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await apiService.getServices();
        setServices(data);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-600 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Nos Services
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Des solutions complètes pour accompagner votre transformation digitale
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {error && (
            <div className="text-center text-red-600 mb-8">{error}</div>
          )}
          {services.length === 0 ? (
            <div className="text-center text-gray-500">Aucun service disponible</div>
          ) : (
            <div className="space-y-16">
              {services.map((service, index) => (
                <motion.div
                  key={service.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="grid md:grid-cols-2 gap-12 items-center"
                >
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                      {service.name}
                    </h2>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-6 py-3 rounded-full font-semibold">
                      ${service.price}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12 min-h-64 flex items-center justify-center">
                    <span className="text-6xl">{service.icon || '📦'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Pourquoi nous choisir ?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              { icon: Zap, title: "Expertise éprouvée", desc: "Des experts avec plusieurs années d'expérience en transformation digitale" },
              { icon: CheckCircle2, title: "Solutions sur mesure", desc: "Chaque projet est unique et mérite une approche adaptée" },
              { icon: ArrowRight, title: "Approche agile", desc: "Flexibilité et rapidité d'adaptation aux changements" },
              { icon: Building2, title: "Impact local", desc: "Solutions pensées pour le contexte africain" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Vous avez un projet en tête ?
          </h2>
          <p className="text-lg text-green-100 mb-8">
            Contactez notre équipe pour discuter de vos besoins spécifiques.
          </p>
          <button 
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-2 bg-white text-green-600 hover:bg-slate-100 font-semibold px-8 py-4 rounded-full transition-colors"
          >
            Prenez contact
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
