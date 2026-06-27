using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace TanıtımWebSitesi.Models
{
    public class Uye
    {
        public int Id { get; set; }
        [DisplayName("Ad")]
        [StringLength(50)]
        public string Ad { get; set; }
        [DisplayName("Soyad")]
        [StringLength(50)]
        public string? Soyad { get; set; }
        [DisplayName("E-posta")]
        [StringLength(500)]
        [EmailAddress]
        public string Eposta { get; set; }
        [DisplayName("Şifre")]
        [StringLength(50)]
        public string Şifre { get; set; }
        [DisplayName("Telefon")]
        [StringLength(50)]
        [Phone]
        public string? Telefon { get; set; }


    }
}

