import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Eye, 
  Rocket,
  CheckCircle2,
} from 'lucide-react';

export default function About() {
  const values = [
    "Une compréhension fine des réalités africaines",
    "Des compétences solides en gestion de projet et data",
    "Une vision orientée impact social",
    "Une approche agile et proche du terrain"
  ];

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
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              À propos de
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-500">
                TRU GROUP
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Cabinet de conseil et d'ingénierie digitale dédié à la transformation numérique en Afrique.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Qui sommes-nous ?
              </h2>
              <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                <p>
                  <strong className="text-slate-900">TRU GROUP</strong> est un cabinet de conseil et d'ingénierie digitale basé au Cameroun. Nous aidons les entreprises, ONG et institutions à améliorer leurs processus, moderniser leurs services et déployer des solutions numériques innovantes.
                </p>
                <p>
                  Né d'une équipe pluridisciplinaire d'experts, TRU GROUP s'appuie sur une expertise reconnue et une vision claire : rendre la technologie accessible à tous.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 mx-auto mb-6 bg-green-500 rounded-3xl flex items-center justify-center overflow-hidden">
                      <span className="text-6xl">🏢</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">TRU GROUP</h3>
                    <p className="text-green-600 mt-2">Au cœur de l'innovation</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-500/20 rounded-full blur-2xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Notre Mission",
                description: "Rendre le digital accessible, utile et durable pour tous en Afrique. Nous créons des solutions qui répondent aux vrais besoins du terrain.",
                color: "bg-green-500"
              },
              {
                icon: Eye,
                title: "Notre Vision",
                description: "Devenir le cabinet de référence en Afrique francophone pour la digitalisation des services publics et les technologies à impact.",
                color: "bg-blue-600"
              },
              {
                icon: Rocket,
                title: "Notre Ambition",
                description: "D'ici 2030, devenir un acteur majeur de la digitalisation en Afrique Centrale, en développant des solutions locales pour des besoins locaux.",
                color: "bg-emerald-600"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-5xl">👨‍💼</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Emmanuel Foka Ziegoube</h3>
              <p className="text-green-600 font-semibold mb-4">Fondateur & PDG</p>
              <p className="text-slate-600 leading-relaxed">
                Ingénieur en génie logiciel | Lauréat CASAM-INOV, PNUD, ECAM<br/>
                Expert en transformation digitale et innovation sociale.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
