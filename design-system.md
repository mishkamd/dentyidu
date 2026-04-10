// REQUIRED DEPENDENCIES:
// - lucide-react (npm install lucide-react)
// - framer-motion (npm install framer-motion)

import React from 'react';
import { ChevronRight, Calendar, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DentyMDHero = () => {
  // Visual System Constants
  const colors = {
    brand: '#0F5A5C', // Deep medical teal
    accent: '#E8F3F1', // Soft mint wash
    textMain: '#1A2C2C',
    textMuted: '#5E7373',
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#FAFBFA] px-6 py-24">
      {/* Background Architectural Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#E8F3F1] rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-5%] left-[-2%] w-[400px] h-[400px] bg-[#EEF2F6] rounded-full blur-[100px] opacity-40" />
        
        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(${colors.brand} 1px, transparent 1px), linear-gradient(90deg, ${colors.brand} 1px, transparent 1px)`,
            backgroundSize: '60px 60px' 
          }} 
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* Tagline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E2E8E8] shadow-sm mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#2DD4BF] animate-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase text-[#5E7373]">
              Turism Dentar • Chișinău
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-light tracking-tight text-[#1A2C2C] leading-[1.1] mb-8"
          >
            Zâmbetul tău nu are <br />
            <span className="font-serif italic text-[#0F5A5C]">frontiere.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl text-lg md:text-xl text-[#5E7373] leading-relaxed font-light mb-12"
          >
            DentyMD îmbină expertiza medicală de elită din Moldova cu tehnologia digitală de ultimă oră. Beneficiază de tratamente premium la standarde europene.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-5"
          >
            <button 
              className="group relative flex items-center gap-3 bg-[#0F5A5C] text-white px-8 py-4 rounded-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#0F5A5C]/20 active:scale-[0.98]"
            >
              <Calendar size={18} />
              <span className="font-medium">Programează o Consultație</span>
              <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button 
              className="group flex items-center gap-3 bg-transparent border border-[#CCD6D6] text-[#1A2C2C] px-8 py-4 rounded-full transition-all duration-300 hover:bg-white hover:border-[#0F5A5C] active:scale-[0.98]"
            >
              <span className="font-medium">Vezi Tarifele</span>
              <ArrowUpRight size={18} className="text-[#0F5A5C] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100"
          >
            {['Digital Aesthetics', 'Implants Expert', 'ISO Certified', 'European Dental Association'].map((label) => (
              <span key={label} className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5E7373]">
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Decorative Floating Card (Right) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="hidden xl:block absolute right-12 bottom-24 p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-2xl"
      >
        <div className="flex flex-col gap-1">
          <span className="text-[#0F5A5C] font-bold text-2xl">4.9/5</span>
          <span className="text-[10px] uppercase tracking-wider text-[#5E7373]">Recenzii Pacienți</span>
          <div className="flex gap-1 mt-1 text-[#2DD4BF]">
            {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DentyMDHero;
