import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import contentData from './data/content.json';

// Pages & Components
import Home from './pages/Home';
import MasterRoom from './pages/MasterRoom';
import InstagramLinks from './pages/InstagramLinks';
import Navigation from './components/Navigation';

const App: React.FC = () => {
  const { storeInfo, links } = contentData;

  return (
    <Router basename="/inakaclub-web">
      <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
        <Navigation />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/masters-room" element={<MasterRoom />} />
            <Route path="/instagram" element={<InstagramLinks />} />
          </Routes>
        </main>

        {/* --- Global Footer --- */}
        <footer className="pt-24 pb-12 bg-black border-t border-zinc-900">
          <div className="app-container">
            <div className="grid md:grid-cols-3 gap-16 mb-20">
              <div>
                <h2 className="text-3xl font-serif mb-6 neon-text-pink">{storeInfo.name}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  {storeInfo.description}
                </p>
                <div className="flex gap-6">
                  <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors">
                    FACEBOOK
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-sm tracking-widest text-amber-600 uppercase mb-8">Opening Hours</h4>
                <ul className="text-gray-400 space-y-4 text-sm">
                  <li className="flex justify-between">
                    <span>OPEN:</span>
                    <span className="text-white">{storeInfo.businessHours.open}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>CLOSE:</span>
                    <span className="text-white">{storeInfo.businessHours.close}</span>
                  </li>
                  <li className="flex justify-between border-t border-zinc-900 pt-4 mt-4">
                    <span>CLOSED ON:</span>
                    <span className="text-amber-700">{storeInfo.businessHours.closedOn}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm tracking-widest text-amber-600 uppercase mb-8">Access</h4>
                <p className="text-gray-300 text-sm mb-4">{storeInfo.location.address}</p>
                <p className="text-gray-500 text-xs mb-8">{storeInfo.location.access}</p>
                <a 
                  href={storeInfo.location.mapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 underline hover:text-amber-400"
                >
                  VIEW MAP
                </a>
              </div>
            </div>
            
            <div className="text-center text-[10px] text-zinc-700 uppercase tracking-widest border-t border-zinc-900 pt-12">
              &copy; 2026 {storeInfo.name} / Created by Gabin & An-chan
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
