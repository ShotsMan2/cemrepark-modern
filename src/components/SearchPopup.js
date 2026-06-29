export default function SearchPopup() {
  return (
    <div className="search-popup">
        <div className="search-popup-container">

            <form role="search" method="get" className="form-group" action="/search">
                <input type="search" id="search-form" className="form-control border-0 border-bottom"
                       placeholder="Yazıp enter tuşuna basın" value="" name="q" />
                <button type="submit" className="search-submit border-0 position-absolute bg-white"
                        style={{top: '15px', right: '15px'}}>
                    <svg className="search" width="24" height="24">
                        <use xlinkHref="#search"></use>
                    </svg>
                </button>
            </form>

            <h5 className="cat-list-title">Kategorilere Göz Atın</h5>

            <ul className="cat-list">
                <li className="cat-list-item">
                    <a href="#" title="Jackets">Tesettür Abiye</a>
                </li>
                <li className="cat-list-item">
                    <a href="#" title="T-shirts">Tesettür Elbise</a>
                </li>
                <li className="cat-list-item">
                    <a href="#" title="Handbags">Tesettür Takım</a>
                </li>
                <li className="cat-list-item">
                    <a href="#" title="Accessories">Kap</a>
                </li>
                <li className="cat-list-item">
                    <a href="#" title="Cosmetics">Tunik</a>
                </li>
                <li className="cat-list-item">
                    <a href="#" title="Dresses">Takım</a>
                </li>
                <li className="cat-list-item">
                    <a href="#" title="Jumpsuits">Pantolon</a>
                </li>
                <li className="cat-list-item">
                    <a href="#" title="Jumpsuits">Ceket</a>
                </li>
            </ul>

        </div>
    </div>

  );
}