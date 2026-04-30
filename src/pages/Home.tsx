import React from 'react';
import contentData from '../data/content.json';
import masterIllust from '../assets/master_illust.jpg';

const Home: React.FC = () => {
  const { storeInfo, content } = contentData;

  return (
    <>
      {/* --- Header / Hero Section --- */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Amber Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 scale-105"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop")',
            filter: 'brightness(0.3) contrast(1.1)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-serif mb-4 neon-text-pink leading-tight">
            {storeInfo.name}
          </h1>
          <p className="text-xl md:text-2xl font-light text-amber-500 tracking-[0.3em] uppercase mb-8">
            {storeInfo.tagline}
          </p>
          <div className="h-px w-24 bg-amber-600 mx-auto mb-8"></div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {storeInfo.description}
          </p>
          
          <div className="mt-12">
            <a 
              href="#system" 
              className="inline-block px-10 py-4 border border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-black transition-all duration-500 tracking-widest text-sm"
            >
              MEMBERS & SYSTEM
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-amber-600 to-transparent"></div>
        </div>
      </header>

      {/* --- Master Section --- */}
      <section className="section-padding app-container relative">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 border border-amber-900/30 transition-all group-hover:-inset-2"></div>
            <img 
              src={masterIllust} 
              alt="Master" 
              className="relative z-10 w-full h-[450px] object-contain bg-[#1a1512] p-5 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
            />
            <div className="absolute top-4 right-4 z-20 bg-black/80 p-4 border border-amber-500/50 backdrop-blur-sm">
              <span className="text-xs tracking-tighter text-amber-500 font-serif">AUTHENTIC SNACK</span>
            </div>
          </div>
          
          <div>
            <span className="text-amber-600 tracking-widest text-sm mb-4 block uppercase font-bold">The Owner</span>
            <h2 className="text-4xl font-serif mb-8">{content.master.name} - {content.master.title}</h2>
            <div className="w-16 h-1 bg-amber-600 mb-8"></div>
            <p className="text-gray-400 text-lg leading-loose italic">
              "{content.master.message}"
            </p>
          </div>
        </div>
      </section>

      {/* --- System Section --- */}
      <section id="system" className="section-padding bg-zinc-950">
        <div className="app-container">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif mb-2">SYSTEM</h2>
            <p className="text-amber-700 tracking-[0.5em] text-xs uppercase font-bold">いなかくらぶ の楽しみ方</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {content.system.map((item, idx) => (
              <div key={idx} className="card group hover:border-amber-600/50 transition-all duration-500">
                <h3 className="text-xl mb-4 text-amber-500 group-hover:neon-text-pink transition-all">{item.title}</h3>
                <p className="text-gray-400 mb-6 text-sm">{item.description}</p>
                {item.price && (
                  <p className="text-2xl font-serif text-white">{item.price}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- News Section --- */}
      <section className="section-padding app-container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-zinc-900 pb-8">
          <h2 className="text-4xl font-serif">NEWS & EVENTS</h2>
          <span className="text-amber-800 font-serif italic text-sm">最新情報をお届けします</span>
        </div>

        <div className="space-y-12">
          {content.news.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-8 border-b border-zinc-900/50 pb-12 hover:bg-zinc-900/10 transition-colors">
              <div className="md:w-1/4">
                <span className="text-amber-600 font-mono text-sm tracking-tighter">{item.date}</span>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-2xl mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
