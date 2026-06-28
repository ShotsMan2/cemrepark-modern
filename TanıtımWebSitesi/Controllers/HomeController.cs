using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics;
using TanıtımWebSitesi.Models;

namespace TanıtımWebSitesi.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ISessionService _sessionService;

        public HomeController(ILogger<HomeController> logger, ISessionService sessionService)
        {
            _logger = logger;
            _sessionService = sessionService;
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Kategori(string id)
        {
            string categoryName = string.IsNullOrEmpty(id) ? "" : id.Replace("-", " ");
            ViewBag.KategoriAdi = categoryName;
            
            var allProducts = GetShopierProducts();
            
            // Eğer belirli bir ürüne/kategoriye tıklandıysa sadece onu getir, 
            // değilse (veya bulunamadıysa) hepsini getir.
            var filteredProducts = allProducts
                .Where(x => string.IsNullOrEmpty(categoryName) || 
                            x.Ad.Contains(categoryName, StringComparison.OrdinalIgnoreCase) ||
                            categoryName.Contains(x.Ad, StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(x.Ad, categoryName, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (!filteredProducts.Any())
            {
                filteredProducts = allProducts; // Bulunamazsa hepsini göster
            }

            return View(filteredProducts);
        }

        private List<TanıtımWebSitesi.Models.Admin.Aurun> GetShopierProducts()
        {
            return new List<TanıtımWebSitesi.Models.Admin.Aurun>
            {
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 1, Ad = "Volan Detaylı Etekli Takım", Fiyat = 2500m, Gorsel = "/assets/siteimg/yeni1.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 2, Ad = "Büyük Beden Jakarlı Tunik", Fiyat = 1400m, Gorsel = "/assets/siteimg/yeni2.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 3, Ad = "Modal Nakışlı Tunik", Fiyat = 1500m, Gorsel = "/assets/siteimg/yeni3.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 4, Ad = "Modal Pantolonlu Takım", Fiyat = 2500m, Gorsel = "/assets/siteimg/yeni1.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 5, Ad = "Beray Taş İşlemeli Takım", Fiyat = 2750m, Gorsel = "/assets/siteimg/yeni2.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 6, Ad = "Eylül Düğmeli Gömlek", Fiyat = 1300m, Gorsel = "/assets/siteimg/yeni3.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 7, Ad = "Çıtçıt Düğmeli Uzun Tunik", Fiyat = 1700m, Gorsel = "/assets/siteimg/yeni1.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 8, Ad = "Organize 3'lü Takım", Fiyat = 3500m, Gorsel = "/assets/siteimg/yeni2.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 9, Ad = "Apoletli Trenç", Fiyat = 2000m, Gorsel = "/assets/siteimg/yeni3.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 10, Ad = "Desenli Jile Takım", Fiyat = 2750m, Gorsel = "/assets/siteimg/yeni1.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 11, Ad = "Saten Etekli Takım", Fiyat = 2500m, Gorsel = "/assets/siteimg/yeni2.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 12, Ad = "Fermuarlı Etekli Takım", Fiyat = 2500m, Gorsel = "/assets/siteimg/yeni3.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 13, Ad = "Boncuklu Etekli Takım", Fiyat = 2500m, Gorsel = "/assets/siteimg/yeni1.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 14, Ad = "Pekşen Pantolonlu Takım", Fiyat = 2500m, Gorsel = "/assets/siteimg/yeni2.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 15, Ad = "Kampanyalı Etekli Takımlar (3 Model)", Fiyat = 1500m, Gorsel = "/assets/siteimg/yeni3.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 16, Ad = "Tensel Etekli Takım", Fiyat = 2500m, Gorsel = "/assets/siteimg/yeni1.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 17, Ad = "Taş İşlemeli Etekli Takım", Fiyat = 2500m, Gorsel = "/assets/siteimg/yeni2.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 18, Ad = "Spor Bsn Etekli Takım", Fiyat = 2500m, Gorsel = "/assets/siteimg/yeni3.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 19, Ad = "Güpürlü Elbise", Fiyat = 3000m, Gorsel = "/assets/siteimg/yeni1.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 20, Ad = "Jileli Elbise", Fiyat = 1750m, Gorsel = "/assets/siteimg/yeni2.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 21, Ad = "Jileli Bronşlu Elbise", Fiyat = 2750m, Gorsel = "/assets/siteimg/yeni3.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 22, Ad = "Bol Paça Pantolon", Fiyat = 600m, Gorsel = "/assets/siteimg/yeni1.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 23, Ad = "İspanyol Paça Dabil Pantolon", Fiyat = 600m, Gorsel = "/assets/siteimg/yeni2.jpg" },
                new TanıtımWebSitesi.Models.Admin.Aurun { Id = 24, Ad = "Beyoğlu Taşlı Pantolon", Fiyat = 600m, Gorsel = "/assets/siteimg/yeni3.jpg" }
            };
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult uye()
        {
            return View();
        }

        public IActionResult uyeliste()
        {
            return View();
        }

        public IActionResult iletisim()
        {
            iletisimViewModel nesne = new iletisimViewModel();
            return View(nesne);
        }
        [HttpPost]
        public IActionResult iletisim(iletisimViewModel nesne)
        {
            if (ModelState.IsValid)
            {
                ViewBag.bitis = "Başarılı";
            }
            return View(nesne);
        }
        public IActionResult urundetay(int id = 1)
        {
            var product = GetShopierProducts().FirstOrDefault(p => p.Id == id);
            if (product == null)
            {
                product = GetShopierProducts().First();
            }
            return View(product);
        }
        public IActionResult urundetay2()
        {
            return View();
        }
        public IActionResult Giris()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Giris(string eposta, string sifre)
        {
            if (!eposta.IsNullOrEmpty())
            {
                if (!sifre.IsNullOrEmpty())
                {
                    if (sifre == "0852" && eposta == "uysalselimefe@gmail.com")
                    {
                        _sessionService.SetString("giris", "uysalselimefe@gmail.com");
                    }
                    else
                    {
                        ViewBag.sonuc = "E-posta veya şifre hatalı!";
                    }
                }
                else
                {
                    ViewBag.sonuc = "şifre boş geçilemez! Lütfen şifrenizi giriniz.";
                }
            }
            else
            {
                ViewBag.sonuc = "E-posta ve şifre boş geçilemez! Lütfen e-posta ve şifrenizi giriniz.";
            }
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
