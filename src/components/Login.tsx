import React, { useState } from 'react';
import { Hospital, LogIn, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Captcha State
  const [isCaptchaSolved, setIsCaptchaSolved] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (isCaptchaSolved) return;
    
    setSliderPosition(val);
    if (val >= 95) {
      setIsCaptchaSolved(true);
      setSliderPosition(100);
    }
  };

  const handleSliderRelease = () => {
    if (!isCaptchaSolved) {
      setSliderPosition(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username !== 'Budi' || password !== 'Syamsudin') {
      setError('Username atau password salah.');
      return;
    }

    if (!isCaptchaSolved) {
      setError('Selesaikan slider captcha terlebih dahulu.');
      return;
    }

    onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl relative z-10 border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
            <Hospital className="text-white" size={32} />
          </div>
          <img src="/logo-rsud.png" alt="Logo RSUD R. Syamsudin" className="h-16 object-contain mb-2" onError={(e) => e.currentTarget.style.display = 'none'} />
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            BI Enterprise
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Dashboard Evaluasi Casemix
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
              <input
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">Verifikasi Keamanan</label>
            <div 
              className={`relative h-12 rounded-xl overflow-hidden border select-none transition-all ${
                isCaptchaSolved ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <div 
                className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                  isCaptchaSolved ? 'bg-emerald-500' : 'bg-teal-500/20'
                }`}
                style={{ width: `${sliderPosition}%` }}
              />
              
              <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold tracking-wide pointer-events-none">
                {isCaptchaSolved ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    ✓ Terverifikasi!
                  </span>
                ) : (
                  <span className="text-gray-500">Geser ke kanan untuk verifikasi →</span>
                )}
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                disabled={isCaptchaSolved}
                onChange={handleSliderChange}
                onMouseUp={handleSliderRelease}
                onTouchEnd={handleSliderRelease}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default z-20"
              />

              {!isCaptchaSolved && (
                <div
                  className="absolute top-1 bottom-1 w-10 bg-white rounded-lg shadow-md flex items-center justify-center text-teal-600 border border-gray-200 pointer-events-none transition-all duration-75"
                  style={{ left: `calc(${sliderPosition}% - ${(sliderPosition / 100) * 40}px)` }}
                >
                  <ArrowRight size={18} />
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                !isCaptchaSolved || !username || !password ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
              } transition-colors`}
              disabled={!isCaptchaSolved || !username || !password}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className={`h-5 w-5 ${!isCaptchaSolved ? 'text-gray-300' : 'text-teal-500 group-hover:text-teal-400'}`} aria-hidden="true" />
              </span>
              Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
