import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/services');
        if (!response.ok) throw new Error('Erreur chargement services');
        const data = await response.json();
        setServices(data || []);
      } catch (err) {
        console.error('❌ Erreur:', err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    // Polling toutes les 30 secondes
    const interval = setInterval(fetchServices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-600 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              🛠️ Nos Services
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Des solutions complètes et innovantes pour transformer votre vision en réalité
            </p>
          </motion.div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-24 bg-white">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        </section>
      )}

      {/* Services Grid */}
      {!loading && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            {services.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                <p className="text-lg">Aucun service disponible pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-slate-200 hover:border-emerald-500/50"
                  >
                    {/* Image */}
                    {service.image && (
                      <div className="h-64 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden relative">
                        <img 
                          src={
                            service.image.startsWith('http')
                              ? service.image
                              : service.image.startsWith('/uploads')
                                ? `http://localhost:5000${service.image}`
                                : service.image
                          }
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {service.name}
                      </h3>

                      {service.category && (
                        <p className="text-emerald-600 font-semibold text-sm mb-4 inline-block px-3 py-1 bg-emerald-50 rounded-full">
                          {service.category}
                        </p>
                      )}

                      <p className="text-slate-600 text-base mb-6 line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>

                      {service.price && (
                        <p className="text-3xl font-bold text-emerald-600 mb-6">
                          ${service.price}
                        </p>
                      )}

                      {/* Features */}
                      {Array.isArray(service.features) && service.features.length > 0 && (
                        <div className="space-y-2 mb-6 pt-6 border-t border-slate-200">
                          <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
                            Caractéristiques
                          </p>
                          <ul className="space-y-2">
                            {service.features.slice(0, 3).map((feature, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                        En savoir plus
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-lg text-slate-600">Expertise, innovation et qualité</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Zap, title: "Expertise éprouvée", desc: "Des experts expérimentés en transformation numérique" },
              { icon: CheckCircle2, title: "Solutions sur mesure", desc: "Approche adaptée à vos besoins spécifiques" },
              { icon: ArrowRight, title: "Flexibilité", desc: "Adapté à l'évolution de votre projet" },
              { icon: Building2, title: "Support complet", desc: "Accompagnement du début à la fin" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
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
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à transformer votre projet?
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            Contactez notre équipe pour discuter de vos besoins spécifiques.
          </p>
          <button 
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-2 bg-white text-emerald-600 hover:bg-slate-100 font-bold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-lg"
          >
            Nous contacter
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
