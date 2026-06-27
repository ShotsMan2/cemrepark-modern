using System.ComponentModel.DataAnnotations;

namespace TanıtımWebSitesi.Models
{
    public class CheckoutViewModel
    {
        [Required(ErrorMessage = "Ad Soyad alanı zorunludur.")]
        public string AdSoyad { get; set; }

        [Required(ErrorMessage = "Telefon alanı zorunludur.")]
        public string Telefon { get; set; }

        [Required(ErrorMessage = "Adres alanı zorunludur.")]
        public string Adres { get; set; }

        [Required(ErrorMessage = "Kart Üzerindeki İsim zorunludur.")]
        public string KartIsim { get; set; }

        [Required(ErrorMessage = "Kart Numarası zorunludur.")]
        [RegularExpression(@"^\d{16}$", ErrorMessage = "Kart Numarası 16 haneli olmalıdır.")]
        public string KartNumara { get; set; }

        [Required(ErrorMessage = "Son Kullanma Ay/Yıl zorunludur.")]
        public string SonKullanma { get; set; }

        [Required(ErrorMessage = "CVV zorunludur.")]
        [RegularExpression(@"^\d{3}$", ErrorMessage = "CVV 3 haneli olmalıdır.")]
        public string Cvv { get; set; }
    }
}
