import React from 'react';
import contentData from '../data/content.json';

const MasterRoom: React.FC = () => {
  const { news } = contentData.content;
  const masterPosts = news.filter((item: any) => item.category === 'master');

  return (
    <div className="pt-32 pb-20 app-container min-h-screen">
      {/* Header */}
      <div className="mb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-serif mb-6 neon-text-pink">マスターの部屋</h1>
        <p className="text-amber-600 tracking-[0.4em] text-xs uppercase font-bold mb-8">Reflections & SNS Summaries</p>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto"></div>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-24">
        {masterPosts.length > 0 ? (
          masterPosts.map((post: any, idx) => (
            <article key={idx} className="relative group">
              {/* Decorative Date Element */}
              <div className="absolute -left-4 md:-left-12 top-0 flex flex-col items-center">
                <span className="text-amber-900 font-serif text-6xl opacity-20 select-none">
                  {post.date.split('.')[2]}
                </span>
                <span className="text-amber-600 font-mono text-xs tracking-widest -mt-4 uppercase">
                  {post.date.split('.')[1]}月
                </span>
              </div>

              <div className="pl-12 md:pl-20">
                <div className="flex items-center gap-4 mb-6">
                  <span className="h-px w-8 bg-amber-900"></span>
                  <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{post.date}</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-serif mb-8 group-hover:text-amber-500 transition-colors duration-500 leading-tight">
                  {post.title}
                </h2>

                <div className="bg-zinc-900/30 border-l-2 border-amber-900/50 p-8 md:p-12 backdrop-blur-sm hover:bg-zinc-900/50 transition-all duration-500">
                  <p className="text-gray-300 text-lg leading-loose whitespace-pre-wrap font-light mb-10">
                    {post.content}
                  </p>

                  {post.url && (
                    <div className="flex justify-end">
                      <a 
                        href={post.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-amber-950/30 border border-amber-900/50 text-amber-500 text-xs tracking-widest uppercase hover:bg-amber-600 hover:text-black transition-all duration-500 group"
                      >
                        Instagramで投稿を見る
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800">
            <p className="text-zinc-500 italic">まだ投稿がありません。マスターの呟きをお楽しみに。</p>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-32 text-center">
        <a href="/" className="text-zinc-500 hover:text-amber-600 transition-colors text-sm tracking-widest uppercase border-b border-zinc-800 pb-2">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

export default MasterRoom;
