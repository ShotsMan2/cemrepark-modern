import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer id="footer" className="geo-footer mt-5">

    <div className="container">
        <div className="row d-flex flex-wrap justify-content-between py-5">
            <div className="col-md-3 col-sm-6">
                <div className="footer-menu footer-menu-001">
                    <div className="footer-intro mb-4">
                        <a href="/home/index/">
                            <img src="/assets/siteimg/cemre park.png?v=3" alt="logo" width="141" />
                        </a>
                    </div>
                    <p>
                        Sahibata mahallesi Başaralı caddesi No:18A,<br/>
                        Konya, Turkey
                    </p>
                    <div className="social-links">
                        <ul className="list-unstyled d-flex flex-wrap gap-3">
                            <li>
                                <a href="#" className="text-secondary">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <use xlinkHref="#facebook"></use>
                                    </svg>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-secondary">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <use xlinkHref="#twitter"></use>
                                    </svg>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-secondary">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <use xlinkHref="#youtube"></use>
                                    </svg>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-secondary">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <use xlinkHref="#pinterest"></use>
                                    </svg>
                                </a>
                            </li>
                            <li>
                                <a href="https://www.instagram.com/cemrepark/" className="text-secondary">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <use xlinkHref="#instagram"></use>
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6">
                <div className="footer-menu footer-menu-002">
                    <h5 className="widget-title text-uppercase mb-4">KURUMSAL</h5>
                    <ul className="menu-list list-unstyled text-uppercase border-animation-left fs-6">
                        <li className="menu-item">
                            <a href="index.html" className="item-anchor">Hakkımızda</a>
                        </li>
                        <li className="menu-item">
                            <a href="/Home/iletisim" className="item-anchor">İletişim Formu</a>
                        </li>
                        <li className="menu-item">
                            <a href="blog.html" className="item-anchor">Mağazalarımız</a>
                        </li>
                        <li className="menu-item">
                            <a href="styles.html" className="item-anchor">İletişim</a>
                        </li>
                        <li className="menu-item">
                            <a href="#" className="item-anchor">Blog</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="col-md-3 col-sm-6">
                <div className="footer-menu footer-menu-003">
                    <h5 className="widget-title text-uppercase mb-4">KATEGORİLER</h5>
                    <ul className="menu-list list-unstyled text-uppercase border-animation-left fs-6">
                        <li className="menu-item">
                            <a href="#" className="item-anchor">Tesettür Abiye</a>
                        </li>
                        <li className="menu-item">
                            <a href="#" className="item-anchor">Tesettür Elbise</a>
                        </li>
                        <li className="menu-item">
                            <a href="#" className="item-anchor">Tesettür Takım</a>
                        </li>
                        <li className="menu-item">
                            <a href="#" className="item-anchor">Yeni Sezon</a>
                        </li>
                        <li className="menu-item">
                            <a href="#" className="item-anchor">Çok Satanlar</a>
                        </li>                        
                    </ul>
                </div>
            </div>
            <div className="col-md-3 col-sm-6">
                <div className="footer-menu footer-menu-004 border-animation-left">
                    <h5 className="widget-title text-uppercase mb-4">Bize Ulaşın</h5>
                    <p>
                        Sorularınız ve siparişleriniz için: <br/>
                        <a href="https://shopier.com/CEMREPARKK" className="item-anchor" target="_blank">Shopier Mağazamız</a>
                    </p>
                    <p>
                        WhatsApp Sipariş Hattı: <br/>
                        <a href="https://wa.me/905541698909" className="item-anchor">
                            0554 169 89 09
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </div>
    <div className="border-top pt-4 pb-3">
        <div className="container">
            <div className="row">
                <div className="col-md-6 d-flex flex-wrap">
                    <div className="shipping">
                        <span>Şunlarla gönderiyoruz:</span>
                        <img src="https://static.ticimax.cloud/57246/uploads/footertasarim/9/b057bafc-1631-41a0-913d-62093db48866.jpg" alt="icon" />
                        
                    </div>
                    <div className="payment-option">
                        <span>Ödeme Seçeneği:</span>
                        <img src="https://static.ticimax.cloud/57246/uploads/footertasarim/9/b057bafc-1631-41a0-913d-62093db48866.jpg" alt="card" />
                        
                    </div>
                </div>
                <div className="col-md-6 text-end">
                    <p>
                        © Cemre Park - Tüm Hakları Saklıdır. | All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    </div>

    </footer>
  );
}