import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { siteSettings } from '../data/content';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Adresse",
      value: siteSettings.address,
      color: "bg-green-500"
    },
    {
      icon: Phone,
      title: "Téléphone",
      value: siteSettings.phone,
      color: "bg-blue-600"
    },
    {
      icon: Mail,
      title: "Email",
      value: siteSettings.email,
      color: "bg-emerald-600"
    },
    {
      icon: Clock,
      title: "Horaires",
      value: "Lun - Ven: 8h - 18h",
      color: "bg-purple-600"
    }
  ];

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
              Contactez-nous
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Notre équipe est à votre écoute pour répondre à toutes vos questions et discuter de vos projets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-24 relative z-10">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`w-14 h-14 ${info.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <info.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{info.title}</h3>
                <p className="text-slate-600 text-sm">{info.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Envoyez-nous un message
                </h2>
                <p className="text-lg text-slate-600">
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                </p>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message envoyé !</h3>
                  <p className="text-slate-600">
                    Merci pour votre message. Notre équipe vous contactera très bientôt.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Input
                      label="Nom complet"
                      placeholder="Votre nom"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="votre@email.com"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Input
                      label="Téléphone"
                      type="tel"
                      placeholder="+237 6XX XXX XXX"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    <Input
                      label="Sujet"
                      placeholder="Sujet du message"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Textarea
                    label="Message"
                    placeholder="Votre message..."
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />

                  <Button 
                    size="lg" 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Right Side - Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Horaires d'ouverture</h3>
                <div className="space-y-2 text-slate-600">
                  <p><strong>Lundi - Vendredi:</strong> 8h00 - 18h00</p>
                  <p><strong>Samedi:</strong> Sur rendez-vous</p>
                  <p><strong>Dimanche:</strong> Fermé</p>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Réseaux sociaux</h3>
                <div className="flex gap-4">
                  <a href={siteSettings.facebook_url} className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    f
                  </a>
                  <a href={siteSettings.linkedin_url} className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                    in
                  </a>
                  <a href={siteSettings.twitter_url} className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                    𝕏
                  </a>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-8 border-l-4 border-green-500">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Urgence ?</h3>
                <p className="text-slate-600 mb-4">Pour une demande urgente, appelez directement notre équipe.</p>
                <a href={`tel:${siteSettings.phone}`} className="text-green-600 font-bold text-lg hover:text-green-700">
                  {siteSettings.phone}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-12 bg-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="w-full h-96 bg-slate-300 rounded-2xl flex items-center justify-center text-slate-600">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Localisation: {siteSettings.address}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
