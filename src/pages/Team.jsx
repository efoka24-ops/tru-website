import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Users, Monitor, Database, GraduationCap, Globe } from 'lucide-react';
import { team as defaultTeam } from '../data/content';
import { apiService } from '../api/apiService';

export default function Team() {
  const [teamData, setTeamData] = useState(defaultTeam);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch team data from API
    apiService.getTeam().then(data => {
      if (data && data.length > 0) {
        setTeamData(data);
        console.log('✅ Team data loaded from API:', data.length, 'members');
      } else {
        console.log('ℹ️ Using default team data from content.js');
      }
      setLoading(false);
    });

    // Set up polling to check for updates every 30 seconds
    const pollInterval = setInterval(() => {
      apiService.getTeam().then(data => {
        if (data && data.length > 0) {
          setTeamData(data);
        }
      });
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const expertise = [
    { icon: Code, title: "Ingénieurs", desc: "Développement & Architecture" },
    { icon: Users, title: "Consultants", desc: "Organisation & Stratégie" },
    { icon: Monitor, title: "Experts digitaux", desc: "Transformation numérique" },
    { icon: Database, title: "Analystes data", desc: "Intelligence décisionnelle" },
    { icon: GraduationCap, title: "Formateurs", desc: "Renforcement des capacités" },
    { icon: Globe, title: "Experts terrain", desc: "Développement local" }
  ];

  const founders = teamData.filter(m => m.is_founder);
  const otherMembers = teamData.filter(m => !m.is_founder);

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
              Notre Équipe
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Une équipe pluridisciplinaire d'experts passionnés par l'innovation et le développement de l'Afrique.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Leadership Section */}
      {founders.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Leadership
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Une vision portée par des entrepreneurs engagés
              </p>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              {founders.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
                >
                  <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                    <div className="flex items-center justify-center">
                      <div className="w-full max-w-xs rounded-2xl overflow-hidden shadow-lg">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover aspect-square"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900 mb-2">{member.name}</h3>
                      <p className="text-green-600 font-semibold text-lg mb-4">{member.title}</p>
                      <p className="text-slate-600 leading-relaxed mb-6">{member.bio}</p>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-3">Spécialités:</p>
                        <div className="flex flex-wrap gap-2">
                          {member.specialties.map((spec, i) => (
                            <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Members Section */}
      {otherMembers.length > 0 && (
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Notre Équipe Experte
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Des professionnels talentueux qui concrétisent nos projets
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500"
                >
                  <div className="w-full h-56 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                    <p className="text-green-600 font-semibold mb-3">{member.title}</p>
                    <p className="text-slate-600 text-sm mb-4">{member.bio}</p>
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.map((spec, i) => (
                        <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Expertise Areas */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Nos domaines d'expertise
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une équipe pluridisciplinaire pour couvrir tous les aspects de votre projet
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertise.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all text-center border border-slate-200"
              >
                <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Notre culture d'équipe
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                title: "Collaboration",
                description: "Nous travaillons ensemble pour trouver les meilleures solutions. Chaque membre apporte ses forces et expertise."
              },
              {
                title: "Innovation",
                description: "Nous encourageons la créativité et les nouvelles idées. L'innovation est au cœur de notre approche."
              },
              {
                title: "Excellence",
                description: "Nous visons la qualité dans tout ce que nous faisons. Nos standards sont élevés et nos résultats probants."
              },
              {
                title: "Impact",
                description: "Nous mesurons notre succès par l'impact positif que nous créons pour nos clients et communautés."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border-l-4 border-green-500 shadow-sm hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Vous souhaitez rejoindre notre équipe ?
          </h2>
          <p className="text-lg text-green-100 mb-8">
            Nous sommes toujours à la recherche de talents passionnés pour nous aider à transformer l'Afrique.
          </p>
          <a 
            href="mailto:careers@trugroup.cm" 
            className="inline-block bg-white text-green-600 font-semibold px-8 py-4 rounded-full hover:bg-slate-100 transition-colors"
          >
            Consulter nos offres d'emploi
          </a>
        </div>
      </section>
    </div>
  );
}
