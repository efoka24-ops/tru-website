import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  ArrowRight, 
  Search,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/Button';

export default function NotFound() {
  const suggestions = [
    { label: 'Accueil', link: '/' },
    { label: 'Services', link: '/services' },
    { label: 'Solutions', link: '/solutions' },
    { label: 'À propos', link: '/about' },
    { label: 'Contact', link: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* Error Code Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-block">
            <div className="text-9xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
              404
            </div>
          </div>
        </motion.div>

        {/* Alert Icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="p-4 bg-red-100 rounded-full">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </motion.div>

        {/* main Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Page non trouvée
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
            Vérifiez l'URL ou utilisez la navigation ci-dessous pour continuer.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1 max-w-md mx-auto">
            <Search className="w-5 h-5 text-slate-500 ml-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="flex-1 bg-transparent px-4 py-3 font-medium text-slate-700 placeholder-slate-500 outline-none"
            />
            <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-colors">
              Chercher
            </button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link to="/">
            <Button 
              variant="primary" 
              className="flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <span>Nous contacter</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="border-t border-slate-200 pt-12"
        >
          <p className="text-slate-600 font-medium mb-6">
            Vous cherchez quelque chose ? Parcourez nos sections :
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {suggestions.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={item.link}>
                  <div className="p-4 rounded-2xl bg-slate-50 hover:bg-green-50 transition-colors cursor-pointer group">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-green-600 transition-colors">
                      {item.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-green-600 mt-2 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 pt-12 border-t border-slate-200"
        >
          <p className="text-slate-600 mb-4">
            Vous avez toujours besoin d'aide ?
          </p>
          <Link to="/contact" className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-2">
            Contactez notre équipe support
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
