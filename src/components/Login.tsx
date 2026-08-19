import React, { useState, useRef, useEffect } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    if (!isCaptchaSolved) setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (!isCaptchaSolved) {
      if (sliderPosition > 85) {
        setIsCaptchaSolved(true);
        setSliderPosition(100);
      } else {
        setSliderPosition(0);
      }
    }
  };

  const handleMouseMove = (e: any) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let newLeft = ((e.clientX - rect.left) / rect.width) * 100;
      if (newLeft < 0) newLeft = 0;
      if (newLeft > 100) newLeft = 100;
      setSliderPosition(newLeft);
    }
  };
  
  // Touch support
  const handleTouchMove = (e: any) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      let newLeft = ((touch.clientX - rect.left) / rect.width) * 100;
      if (newLeft < 0) newLeft = 0;
      if (newLeft > 100) newLeft = 100;
      setSliderPosition(newLeft);
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging]);

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
              className={`relative h-12 rounded-lg overflow-hidden border ${isCaptchaSolved ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-300'}`}
              ref={containerRef}
            >
              <div 
                className={`absolute inset-y-0 left-0 transition-all duration-100 ease-out ${isCaptchaSolved ? 'bg-green-100' : 'bg-teal-100'}`}
                style={{ width: `${sliderPosition}%` }}
              ></div>
              
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-500 pointer-events-none select-none">
                {isCaptchaSolved ? <span className="text-green-600">Terverifikasi!</span> : "Geser ke kanan untuk verifikasi"}
              </div>

              <div
                ref={sliderRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                className={`absolute top-1 bottom-1 w-10 rounded shadow flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-100 ease-out z-10 ${isCaptchaSolved ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                style={{ left: `calc(${sliderPosition}% - ${sliderPosition === 100 ? 40 : 0}px)`, marginLeft: sliderPosition === 100 ? 0 : '4px' }}
              >
                <ArrowRight size={16} />
              </div>
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
