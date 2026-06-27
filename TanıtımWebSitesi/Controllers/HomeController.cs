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
            ViewBag.KategoriAdi = string.IsNullOrEmpty(id) ? "Kategori" : id.Replace("-", " ");
            return View();
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
        public IActionResult urundetay()
        {
            return View();
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
