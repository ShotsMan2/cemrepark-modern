export default function SearchPopup() {
  return (
    <div className="search-popup fixed inset-0 bg-black/90 backdrop-blur-md z-[100] hidden items-center justify-center transition-all duration-500">
      <div className="search-popup-container w-full max-w-2xl px-4 relative">
        
        {/* Close Button */}
        <button className="search-popup-close absolute -top-12 right-4 text-gray-500 hover:text-neon-pink transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <form role="search" method="get" className="relative group" action="/search">
          {/* Glowing underline effect */}
          <div className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-neon-pink to-holo-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          
          <input type="search" id="search-form" className="w-full bg-transparent border-b border-gray-800 py-4 text-2xl text-white focus:outline-none placeholder-gray-700 transition-colors"
                 placeholder="Ürün, kategori arayın..." defaultValue="" name="q" />
          <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-holo-gold transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>

        <h5 className="text-gray-500 text-sm tracking-widest uppercase mt-12 mb-6">Popüler Aramalar</h5>

        <ul className="flex flex-wrap gap-3">
          {[
            "Tesettür Elbise", "İkili Takım", "Tunik", "Kap & Kaban", "Pantolon", "Abiye"
          ].map((item, i) => (
            <li key={i}>
              <a href="#" className="inline-block px-4 py-2 border border-gray-800 text-gray-400 text-sm hover:border-neon-pink hover:text-white clip-angled transition-all duration-300">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}