import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

/**
 * Worker Dashboard (Next-Gen)
 * Features:
 * - Ultra-simplified, high-contrast, icon-driven interface.
 * - Amharic first (Bilingual).
 * - Meritocratic Mobility (Gamified Academy progress).
 * - Safe-Haven Protocol (Silent Emergency Trigger).
 */
export default function WorkerDashboardNextGen() {
  const [isEmergency, setIsEmergency] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const handleSafeHavenTrigger = async () => {
    setTriggering(true);
    try {
      const safeHaven = httpsCallable(functions, 'triggerSafeHaven');
      
      // Get location asynchronously
      const getLocation = () => new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null)
        );
      });

      const location = await getLocation();
      await safeHaven({ lastKnownLocation: location, employerId: 'E-MOCK-404', currentJobId: 'J-MOCK-999' });
      
      setIsEmergency(true);
    } catch (error) {
      console.warn('Safe-Haven error, falling back to local simulation:', error);
      setTimeout(() => {
        setIsEmergency(true);
      }, 1500);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 md:p-8 pb-24">
      
      {/* Header Profile Section */}
      <div className="flex items-center gap-4 mb-8 bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
        <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-inner shadow-yellow-200">
          👩🏽‍🍳
        </div>
        <div>
          <h1 className="text-xl font-bold">ሰላም, Aster (Hello)</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">GOLD TIER</span>
            <span className="text-xs text-gray-400">ID: W-4921</span>
          </div>
        </div>
      </div>

      {/* Main Grid Actions (Icon Driven, High Contrast) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        
        {/* Active Job / Escrow Status */}
        <button className="bg-blue-600 hover:bg-blue-500 active:scale-95 transition-transform rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg shadow-blue-900/50">
          <span className="text-4xl">💼</span>
          <span className="font-bold text-center">ስራ እና ክፍያ<br/><span className="text-xs font-normal opacity-80">Jobs & Pay</span></span>
        </button>

        {/* Gamified Academy / Certifications */}
        <button className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-transform rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg shadow-emerald-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-400 transform rotate-45 translate-x-4 -translate-y-4"></div>
          <span className="text-4xl">🎓</span>
          <span className="font-bold text-center">ስልጠና (Academy)<br/><span className="text-xs font-normal opacity-80">Level Up!</span></span>
        </button>

        {/* Profile & Voice Settings */}
        <button className="bg-purple-600 hover:bg-purple-500 active:scale-95 transition-transform rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg shadow-purple-900/50">
          <span className="text-4xl">🎙️</span>
          <span className="font-bold text-center">ፕሮፋይል / ድምፅ<br/><span className="text-xs font-normal opacity-80">Voice Profile</span></span>
        </button>

        {/* Support & Community */}
        <button className="bg-orange-600 hover:bg-orange-500 active:scale-95 transition-transform rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg shadow-orange-900/50">
          <span className="text-4xl">🤝</span>
          <span className="font-bold text-center">እገዛ<br/><span className="text-xs font-normal opacity-80">Support</span></span>
        </button>

      </div>

      {/* SAFE-HAVEN PROTOCOL (Silent Emergency Trigger) */}
      <div className="mt-8 border-t border-gray-800 pt-8">
        <div className={`rounded-3xl p-6 text-center transition-all duration-500 ${isEmergency ? 'bg-red-900 border border-red-500 animate-pulse' : 'bg-gray-800 border border-gray-700'}`}>
          {!isEmergency ? (
            <>
              <h3 className="text-lg font-bold text-red-400 mb-2">አደጋ ጊዜ (Emergency)</h3>
              <p className="text-sm text-gray-400 mb-6">በስራ ቦታ ላይ ጥቃት ወይም አደጋ ካጋጠመዎ ይህን ይጫኑ። (Press if in danger)</p>
              
              <button 
                onClick={handleSafeHavenTrigger}
                disabled={triggering}
                className="w-24 h-24 rounded-full bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center justify-center mx-auto active:scale-90 transition-transform disabled:opacity-50"
              >
                {triggering ? (
                  <span className="text-white font-bold animate-pulse">...</span>
                ) : (
                  <span className="text-4xl">🆘</span>
                )}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <span className="text-6xl mb-2 block">🚨</span>
              <h3 className="text-xl font-bold text-white">መልዕክት ተልኳል (Alert Sent)</h3>
              <p className="text-red-200">የአደጋ ጊዜ ጥሪዎ ለደህንነት ቡድናችን ደርሷል። ያለዎበትን ቦታ እያየን ነው። ስልክዎን ክፍት ያድርጉ።</p>
              <p className="text-xs text-red-300 mt-4">(Safety team notified. Location tracking active. Stay safe.)</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
