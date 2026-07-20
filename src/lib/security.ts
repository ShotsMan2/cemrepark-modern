import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCODING: BufferEncoding = "hex";

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || crypto.createHash("sha256").update("cemrepark-default-key-change-in-production").digest();
  return Buffer.isBuffer(key) ? key.subarray(0, 32) : Buffer.from(key).subarray(0, 32);
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>"'&]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/[^\w\s\.\-\u00C0-\u024F\u0400-\u04FF]/g, "")
    .trim();
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(email) && email.length <= 254;
}

export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  const cleaned = phone.replace(/[\s\-\_\(\)]/g, "");
  const patterns = [
    /^\+90\d{10}$/,
    /^90\d{10}$/,
    /^0\d{10}$/,
    /^\d{10}$/,
  ];
  return patterns.some((p) => p.test(cleaned));
}

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  if (token.length !== 64 || storedToken.length !== 64) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
  } catch {
    return false;
  }
}

export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function hashDataWithSalt(data: string, salt?: string): string {
  const useSalt = salt || process.env.HASH_SALT || "cemrepark-default-salt";
  return crypto.createHmac("sha256", useSalt).update(data).digest("hex");
}

export function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);
  const tag = cipher.getAuthTag().toString(ENCODING);
  return { encrypted, iv: iv.toString(ENCODING), tag };
}

export function decrypt(encrypted: string, iv: string, tag: string): string {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, ENCODING));
  decipher.setAuthTag(Buffer.from(tag, ENCODING));
  let decrypted = decipher.update(encrypted, ENCODING, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function generateSecureId(length = 16): string {
  return crypto.randomBytes(length).toString("base64url");
}

export function generateApiKey(): string {
  const prefix = "cp_";
  const random = crypto.randomBytes(32).toString("base64url");
  return `${prefix}${random}`;
}
