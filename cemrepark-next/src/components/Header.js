import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header id="cemrepark-header">

        
        <div className="cp-topbar">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <div className="cp-topbar-left d-none d-md-flex align-items-center gap-3">
                    <a href="https://wa.me/905541698909" target="_blank"><i className="fa-brands fa-whatsapp"></i> 0554 169 89 09</a>
                    <span>|</span>
                    <a href="https://www.instagram.com/cemrepark/" target="_blank"><i className="fa-brands fa-instagram"></i> @@cemrepark</a>
                </div>
                <div className="cp-topbar-right d-flex align-items-center gap-3">
                    <a href="https://shopier.com/CEMREPARKK" target="_blank"><i className="fa-solid fa-store"></i> Shopier Mağaza</a>
                    <span>|</span>
                    <span className="cp-slogan">Size çok yakışacak! 💫</span>
                </div>
            </div>
        </div>

        
        <div className="cp-logo-bar py-3">
            <div className="container-fluid d-flex justify-content-center align-items-center flex-column flex-md-row px-lg-5" style={{gap: '5rem'}}>
                
                <a href="/home/index/">
                    <img src="/assets/siteimg/cemre park.png?v=4" alt="CemrePark Logo" className="cp-logo" />
                </a>
                
                
                <div className="header-search" style={{width: '100%', maxWidth: '500px'}}>
                    <form action="/Home/Search" method="get" className="d-flex position-relative">
                        <input type="text" name="q" className="form-control rounded-pill bg-dark text-white border-secondary ps-4 pe-5 py-2" placeholder="Ne aramıştınız? (Örn: Tunik, Elbise)" />
                        <button type="submit" className="btn position-absolute end-0 top-0 h-100 px-4 text-white rounded-pill" style={{background: 'transparent'}}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    
    </header>
  );
}