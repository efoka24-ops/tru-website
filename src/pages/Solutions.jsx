import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Target, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Solutions() {
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/solutions');
        if (!response.ok) throw new Error('Erreur chargement solutions');
        const data = await response.json();
        setSolutions(data || []);
      } catch (err) {
        console.error('❌ Erreur:', err);
        setSolutions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();

    // Polling toutes les 30 secondes
    const interval = setInterval(fetchSolutions, 30000);
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
              💡 Nos Solutions
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Des approches globales et intégrées pour résoudre vos défis stratégiques
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

      {/* Solutions Grid */}
      {!loading && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            {solutions.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                <p className="text-lg">Aucune solution disponible pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {solutions.map((solution, index) => (
                  <motion.div
                    key={solution.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-emerald-200 hover:border-emerald-500/50"
                  >
                    {/* Image */}
                    {solution.image && (
                      <div className="h-64 bg-gradient-to-br from-emerald-200 to-emerald-300 overflow-hidden relative">
                        <img 
                          src={
                            solution.image.startsWith('http')
                              ? solution.image
                              : solution.image.startsWith('/uploads')
                                ? `http://localhost:5000${solution.image}`
                                : solution.image
                          }
                          alt={solution.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {solution.name}
                      </h3>

                      {solution.category && (
                        <p className="text-emerald-600 font-semibold text-sm mb-4 inline-block px-3 py-1 bg-emerald-100 rounded-full">
                          {solution.category}
                        </p>
                      )}

                      <p className="text-slate-600 text-base mb-6 line-clamp-3 leading-relaxed">
                        {solution.description}
                      </p>

                      {/* Benefits */}
                      {Array.isArray(solution.benefits) && solution.benefits.length > 0 && (
                        <div className="mb-6 pb-6 border-b border-emerald-200">
                          <p className="text-xs uppercase tracking-widest font-bold text-emerald-600 mb-3">
                            Avantages
                          </p>
                          <ul className="space-y-2">
                            {solution.benefits.slice(0, 3).map((benefit, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Features */}
                      {Array.isArray(solution.features) && solution.features.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3">
                            Caractéristiques
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {solution.features.slice(0, 3).map((feature, i) => (
                              <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <button className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/20 flex items-center justify-center gap-2">
                        Découvrir
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Comment ça marche?
            </h2>
            <p className="text-lg text-slate-600">Approche éprouvée et itérative</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '01', title: "Diagnostic", desc: "Analyse approfondie de vos besoins" },
              { num: '02', title: "Stratégie", desc: "Définition d'une roadmap claire" },
              { num: '03', title: "Implémentation", desc: "Mise en place de la solution" },
              { num: '04', title: "Suivi", desc: "Support et optimisation continue" }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all relative"
              >
                <div className="text-5xl font-bold text-emerald-200 mb-4">{step.num}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Our Solutions */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Pourquoi nos solutions?
            </h2>
            <p className="text-lg text-slate-600">Approche holistique et durable</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Ciblées", desc: "Adaptées à votre contexte spécifique et vos objectifs" },
              { icon: Lightbulb, title: "Innovantes", desc: "Utilisation des meilleures pratiques et technologies" },
              { icon: CheckCircle2, title: "Éprouvées", desc: "Résultats concrets et mesurables garantis" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 border border-emerald-200"
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
            Prêt à trouver la solution?
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            Notre équipe est disponible pour discuter de votre situation spécifique.
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
