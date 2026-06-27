using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using TanıtımWebSitesi.Models;
using TanıtımWebSitesi.Models.Admin;

namespace TanıtımWebSitesi.Controllers
{
    public class CartController : Controller
    {
        private readonly Context _context;

        public CartController()
        {
            _context = new Context();
        }

        // --- CART METHODS ---
        public IActionResult Index()
        {
            var cart = HttpContext.Session.Get<List<CartItem>>("Cart") ?? new List<CartItem>();
            return View(cart);
        }

        [HttpPost]
        public IActionResult AddToCart(int id, string name, decimal price, string image)
        {
            var cart = HttpContext.Session.Get<List<CartItem>>("Cart") ?? new List<CartItem>();
            
            var existingItem = cart.FirstOrDefault(x => x.UrunId == id);
            if (existingItem != null)
            {
                existingItem.Adet++;
            }
            else
            {
                cart.Add(new CartItem { UrunId = id, UrunAdi = name, Fiyat = price, ResimUrl = image, Adet = 1 });
            }

            HttpContext.Session.Set("Cart", cart);
            return Json(new { success = true, cartCount = cart.Sum(x => x.Adet) });
        }

        [HttpPost]
        public IActionResult RemoveFromCart(int id)
        {
            var cart = HttpContext.Session.Get<List<CartItem>>("Cart") ?? new List<CartItem>();
            var itemToRemove = cart.FirstOrDefault(x => x.UrunId == id);
            if (itemToRemove != null)
            {
                cart.Remove(itemToRemove);
                HttpContext.Session.Set("Cart", cart);
            }
            return RedirectToAction("Index");
        }


        // --- FAVORITES METHODS ---
        public IActionResult Favorites()
        {
            var favs = HttpContext.Session.Get<List<CartItem>>("Favorites") ?? new List<CartItem>();
            return View(favs);
        }

        [HttpPost]
        public IActionResult AddToFavorites(int id, string name, decimal price, string image)
        {
            var favs = HttpContext.Session.Get<List<CartItem>>("Favorites") ?? new List<CartItem>();
            
            if (!favs.Any(x => x.UrunId == id))
            {
                favs.Add(new CartItem { UrunId = id, UrunAdi = name, Fiyat = price, ResimUrl = image, Adet = 1 });
                HttpContext.Session.Set("Favorites", favs);
            }
            
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult RemoveFromFavorites(int id)
        {
            var favs = HttpContext.Session.Get<List<CartItem>>("Favorites") ?? new List<CartItem>();
            var itemToRemove = favs.FirstOrDefault(x => x.UrunId == id);
            if (itemToRemove != null)
            {
                favs.Remove(itemToRemove);
                HttpContext.Session.Set("Favorites", favs);
            }
            return RedirectToAction("Favorites");
        }

        // --- CHECKOUT METHODS ---
        public IActionResult Checkout()
        {
            var cart = HttpContext.Session.Get<List<CartItem>>("Cart") ?? new List<CartItem>();
            if (!cart.Any())
            {
                return RedirectToAction("Index");
            }
            return View(new CheckoutViewModel());
        }

        [HttpPost]
        public IActionResult Checkout(CheckoutViewModel model)
        {
            if (ModelState.IsValid)
            {
                // Siparişi tamamla ve sepeti boşalt
                HttpContext.Session.Set("Cart", new List<CartItem>());
                return RedirectToAction("Success");
            }
            return View(model);
        }

        public IActionResult Success()
        {
            return View();
        }
    }
}
