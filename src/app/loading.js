import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-pink/20 rounded-full blur-[120px] animate-pulse"></div>
      
      {/* Premium Loader Container */}
      <div className="relative flex flex-col items-center">
        {/* Rings */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <div className="absolute inset-0 border-t-2 border-r-2 border-neon-pink rounded-full animate-[spin_2s_linear_infinite]"></div>
          <div className="absolute inset-2 border-b-2 border-l-2 border-holo-gold rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
          <div className="absolute inset-4 border-t-2 border-purple-500 rounded-full animate-[spin_1.5s_linear_infinite]"></div>
          
          {/* Center Brand */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-20 h-20">
              <Image 
                src="/assets/siteimg/cemre park.png" 
                alt="Cemre Park Logo" 
                fill 
                className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                priority
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2 relative z-10">
          <h2 className="text-white font-black text-xl uppercase tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-neon-pink via-white to-holo-gold animate-pulse">
            Cemre Park
          </h2>

        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full mt-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-neon-pink to-holo-gold rounded-full animate-[translate_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
}
