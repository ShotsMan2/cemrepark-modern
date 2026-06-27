namespace TanıtımWebSitesi.Models
{
    public class CartItem
    {
        public int UrunId { get; set; }
        public string UrunAdi { get; set; }
        public decimal Fiyat { get; set; }
        public string ResimUrl { get; set; }
        public int Adet { get; set; }
    }
}
