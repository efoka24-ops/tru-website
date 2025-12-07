import React from 'react';
import { motion } from 'framer-motion';
import { solutions, commitments } from '../data/content';
import { Heart, Lock, Star, Users, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';

const iconMap = {
  Star,
  Users,
  Heart,
  Lock
};

export default function Solutions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-600 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Nos Solutions Innovantes
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Des produits technologiques pensés pour les défis spécifiques de l'Afrique
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Detail */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-20">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className={`h-96 rounded-3xl bg-gradient-to-br ${solution.color} flex items-center justify-center text-white ${
                    index % 2 === 1 ? 'lg:order-2' : ''
                  }`}
                >
                  <span className="text-7xl">{solution.icon}</span>
                </motion.div>

                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <h2 className="text-4xl font-bold text-slate-900 mb-2">{solution.name}</h2>
                  <p className="text-xl text-green-600 font-semibold mb-6">{solution.subtitle}</p>
                  
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {solution.longDescription}
                  </p>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Fonctionnalités principales :</h3>
                    <ul className="space-y-2 mb-8">
                      {solution.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white rounded-full">
                    Demander une démo
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitments */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Nos engagements
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Les valeurs qui guident notre mission et nos actions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {commitments.map((commitment, index) => {
              const IconComponent = iconMap[commitment.icon];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all text-center"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{commitment.title}</h3>
                  <p className="text-slate-600">{commitment.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Intéressé par nos solutions ?
          </h2>
          <p className="text-lg text-green-100 mb-8">
            Contactez-nous pour une présentation complète et une démo gratuite
          </p>
          <Button size="lg" className="bg-white text-green-600 hover:bg-slate-100 rounded-full">
            Démarrer maintenant
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
