class EmailService {
  async sendEmail(to, subject, message) {
    if (!to || !subject || !message) {
      const error = new Error("Lütfen tüm alanları doldurun");
      error.statusCode = 400;
      throw error;
    }

    console.log("=========================================");
    console.log("E-POSTA GÖNDERİLDİ (SİMÜLASYON)");
    console.log(`Alıcı: ${to}`);
    console.log(`Konu: ${subject}`);
    console.log(`Mesaj: ${message}`);
    console.log("=========================================");

    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      message: "E-posta başarıyla gönderildi (Simüle edildi).",
    };
  }
}

export const emailService = new EmailService();
