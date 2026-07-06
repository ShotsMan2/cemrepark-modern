import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

const defaultSettings = {
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

class SettingService {
  async getSettings() {
    const settingsRows = await prisma.setting.findMany();

    if (settingsRows.length === 0) {
      return defaultSettings;
    }

    const settings = { ...defaultSettings };

    settingsRows.forEach((row) => {
      let value = row.value;
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (
        !isNaN(Number(value)) &&
        value.trim() !== "" &&
        typeof defaultSettings[row.key] === "number"
      ) {
        value = Number(value);
      }
      settings[row.key] = value;
    });

    return settings;
  }

  async updateSettings(body) {
    for (const [key, value] of Object.entries(body)) {
      const stringValue = typeof value === "string" ? value : String(value);

      await prisma.setting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      });
    }

    const updatedSettings = await this.getSettings();

    try {
      const filePath = path.join(process.cwd(), "src", "data", "settings.json");
      fs.writeFileSync(filePath, JSON.stringify(updatedSettings, null, 2), "utf8");
    } catch (fsError) {
      console.error("settings.json güncellenirken hata oluştu:", fsError);
    }

    return updatedSettings;
  }
}

export const settingService = new SettingService();
