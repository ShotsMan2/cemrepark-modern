import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

class UploadService {
  async uploadFile(file) {
    if (!file) {
      const error = new Error("No file received.");
      error.statusCode = 400;
      throw error;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return {
      message: "Success",
      url: `/uploads/${filename}`,
    };
  }
}

export const uploadService = new UploadService();
