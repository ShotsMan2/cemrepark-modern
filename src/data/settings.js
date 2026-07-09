import fs from "fs";
import path from "path";

export function getSettings() {
  const filePath = path.join(process.cwd(), "src", "data", "settings.json");
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("settings.json okunamadı:", error);
    return {
      siteAdi: "Cemre Park",
      iletisimEposta: "info@cemrepark.com",
      destekTelefonu: "0554 169 89 09",
      adres: "Moda Sokak No: 123, Tekstil Merkezi, İstanbul",
      kargoUcreti: 49.9,
      ucretsizKargoLimiti: 1500,
      ayniGunTeslimat: true,
      bakimModu: false,
      ozelCss: "",
    };
  }
}
