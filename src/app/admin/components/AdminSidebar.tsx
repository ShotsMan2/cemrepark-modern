export default function AdminSidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: { activeTab: string, setActiveTab: (t: string) => void, isOpen: boolean, setIsOpen: (b: boolean) => void }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { id: "products", label: "Ürün Yönetimi", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { id: "orders", label: "Siparişler", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
    { id: "customers", label: "Müşteriler", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { id: "messages", label: "Mesajlar", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" },
    { id: "pages", label: "Sayfalar", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "banners", label: "Banner/Slider", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "coupons", label: "Kuponlar", icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" },
    { id: "ai-support", label: "AI Destek", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "security", label: "Güvenlik", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { id: "audit-logs", label: "Sistem Logları", href: "/admin/audit-logs", isSubItem: true },
    { id: "login-history", label: "Oturum Geçmişi", href: "/admin/login-history", isSubItem: true },
    { id: "settings", label: "Ayarlar", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 glass-panel border-r border-y-0 border-l-0 rounded-none z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 flex-1 flex flex-col overflow-hidden">
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 lg:hidden text-foreground/60 hover:text-foreground"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <a
            href="/admin"
            className="mb-10 text-center block group hover:opacity-80 transition-opacity w-full focus:outline-none cursor-pointer mt-4 lg:mt-0"
          >
            <h2 className="text-2xl font-black text-foreground tracking-[0.2em] uppercase">
              CEMRE<span className="text-primary">PARK</span>
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-2 rounded-full"></div>
            <p className="text-foreground/60 text-[10px] tracking-widest mt-2 uppercase">Yönetim Paneli</p>
          </a>

          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar pb-4 pr-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id || (typeof window !== "undefined" && window.location.pathname === item.href);
              
              const itemContent = (
                <>
                  {item.icon && (
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110 group-hover:text-primary"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  )}
                  {item.label}
                </>
              );

              const className = `w-full flex items-center gap-4 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 group ${
                item.isSubItem ? "pl-12 border-l-2 border-transparent hover:border-primary text-xs" : "clip-angled"
              } ${
                isActive 
                  ? (item.isSubItem ? "text-primary border-primary bg-primary/5" : "bg-primary text-foreground shadow-[0_0_15px_hsla(var(--primary),0.4)]") 
                  : "text-foreground/70 hover:text-foreground hover:bg-primary/10"
              }`;

              if (item.href) {
                return (
                  <a key={item.id} href={item.href} className={className}>
                    {itemContent}
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveTab) setActiveTab(item.id);
                    if (setIsOpen) setIsOpen(false);
                    if (typeof window !== "undefined" && window.location.pathname !== "/admin") {
                       window.location.href = "/admin";
                    }
                  }}
                  className={className}
                >
                  {itemContent}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 pt-4 border-t border-glass-border">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-secondary/20 border border-secondary text-secondary flex items-center justify-center font-bold clip-angled">
                AD
              </div>
              <div>
                <p className="text-foreground font-bold text-sm">Süper Admin</p>
                <p className="text-success text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success inline-block"></span> Çevrimiçi
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
