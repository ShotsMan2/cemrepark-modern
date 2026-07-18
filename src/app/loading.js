"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary opacity-[0.03] rounded-full blur-[100px]"></div>

      <div className="relative flex flex-col items-center z-10">
        {/* Brand Text */}
        <h2 className="text-3xl font-black text-foreground tracking-[0.3em] uppercase mb-12 relative animate-pulse-glow">
          CEMRE<span className="text-primary">PARK</span>
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></span>
        </h2>

        {/* Premium Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-foreground/10"></div>
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-2 border-secondary/20 border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
        </div>

        <p className="mt-8 text-foreground/50 text-xs font-bold uppercase tracking-widest animate-pulse">
          Lütfen Bekleyin...
        </p>
      </div>
    </div>
  );
}
