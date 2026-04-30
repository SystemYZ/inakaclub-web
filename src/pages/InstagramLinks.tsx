import React from 'react';

const InstagramLinks: React.FC = () => {
  return (
    <div className="pt-32 pb-20 app-container">
      <h1 className="text-5xl font-serif mb-8 neon-text-pink">Instagramリンク集</h1>
      <p className="text-amber-600 tracking-widest text-sm mb-12 uppercase font-bold">Gallery & Moments</p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Placeholder for future Instagram links */}
        <div className="card group aspect-square flex items-center justify-center border-dashed border-zinc-800">
           <p className="text-zinc-600 group-hover:text-amber-500 transition-colors">Coming Soon...</p>
        </div>
        <div className="card group aspect-square flex items-center justify-center border-dashed border-zinc-800">
           <p className="text-zinc-600 group-hover:text-amber-500 transition-colors">Coming Soon...</p>
        </div>
        <div className="card group aspect-square flex items-center justify-center border-dashed border-zinc-800">
           <p className="text-zinc-600 group-hover:text-amber-500 transition-colors">Coming Soon...</p>
        </div>
      </div>
    </div>
  );
}

export default InstagramLinks;
