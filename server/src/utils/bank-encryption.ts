// src/utils/bank-encryption.ts
import * as CryptoJS from "crypto-js";
import { BankDetails } from "../models/inventory";

// Helper function to check if data is encrypted
export function isEncrypted(value: string): boolean {
  if (!value || typeof value !== "string") return false;

  try {
    // Try to decrypt - if it fails or returns empty, it's likely not encrypted
    const decrypted = CryptoJS.AES.decrypt(
      value,
      process.env.ENCRYPTION_KEY || "default-32-char-key-for-development-only",
    ).toString(CryptoJS.enc.Utf8);

    // If decryption returns empty string, it's probably not encrypted
    // or if the original value looks like plain text (no special encryption characters)
    return !!(
      (decrypted.length > 0 && value.includes("U2FsdGVkX1")) ||
      value.match(/^[A-Za-z0-9+/]+=*$/)
    );
  } catch (error) {
    return false;
  }
}

// Helper function to safely decrypt bank details
export function safeDecryptBankDetails(bankDetails: BankDetails): BankDetails {
  if (!bankDetails) return bankDetails;

  try {
    // Check each field individually to see if it's encrypted
    const result: BankDetails = { ...bankDetails };

    if (isEncrypted(bankDetails.holderName)) {
      result.holderName = EncryptionUtil.decryptString(bankDetails.holderName);
    }

    if (isEncrypted(bankDetails.accountNumber)) {
      result.accountNumber = EncryptionUtil.decryptString(
        bankDetails.accountNumber,
      );
    }

    if (isEncrypted(bankDetails.name)) {
      result.name = EncryptionUtil.decryptString(bankDetails.name);
    }

    if (isEncrypted(bankDetails.branch)) {
      result.branch = EncryptionUtil.decryptString(bankDetails.branch);
    }

    if (isEncrypted(bankDetails.ifscCode)) {
      result.ifscCode = EncryptionUtil.decryptString(bankDetails.ifscCode);
    }

    return result;
  } catch (error) {
    console.warn("Bank details decryption failed:", error);
    return bankDetails; // Return original data if decryption fails
  }
}

// Transform function to decrypt on retrieval
export function transformBankDetails(doc: any) {
  if (doc && doc.bank) {
    doc.bank = safeDecryptBankDetails(doc.bank);
  }
  return doc;
}

export class EncryptionUtil {
  private static readonly ENCRYPTION_KEY =
    process.env.ENCRYPTION_KEY || "default-32-char-key-for-development-only";

  /**
   * Encrypt a single string value
   */
  static encryptString(value: string): string {
    if (!value || typeof value !== "string") return value;
    try {
      return CryptoJS.AES.encrypt(value, this.ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error("String encryption failed:", error);
      throw new Error("Failed to encrypt string");
    }
  }

  /**
   * Decrypt a single string value
   */
  static decryptString(encryptedValue: string): string {
    if (!encryptedValue || typeof encryptedValue !== "string")
      return encryptedValue;
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedValue,
        this.ENCRYPTION_KEY,
      ).toString(CryptoJS.enc.Utf8);

      // If decryption returns empty string, return original value
      return decrypted || encryptedValue;
    } catch (error) {
      console.error("String decryption failed:", error);
      // Return original value if decryption fails
      return encryptedValue;
    }
  }

  /**
   * Encrypt bank details object
   */
  static encryptBankDetails(data: BankDetails): BankDetails {
    if (!data) return data;

    try {
      return {
        ...data,
        holderName: this.encryptString(data.holderName),
        accountNumber: this.encryptString(data.accountNumber),
        name: this.encryptString(data.name),
        branch: this.encryptString(data.branch),
        ifscCode: this.encryptString(data.ifscCode),
        // accountType doesn't need encryption
        accountType: data.accountType,
      };
    } catch (error) {
      console.error("Bank details encryption failed:", error);
      throw new Error("Failed to encrypt bank details");
    }
  }

  /**
   * Decrypt bank details object
   */
  static decryptBankDetails(encryptedData: BankDetails): BankDetails {
    if (!encryptedData) return encryptedData;

    try {
      return {
        ...encryptedData,
        holderName: this.decryptString(encryptedData.holderName),
        accountNumber: this.decryptString(encryptedData.accountNumber),
        name: this.decryptString(encryptedData.name),
        branch: this.decryptString(encryptedData.branch),
        ifscCode: this.decryptString(encryptedData.ifscCode),
        // accountType doesn't need decryption
        accountType: encryptedData.accountType,
      };
    } catch (error) {
      console.error("Bank details decryption failed:", error);
      // Return original data if decryption fails completely
      return encryptedData;
    }
  }

  /**
   * Check if a string appears to be encrypted
   */
  static isEncrypted(value: string): boolean {
    if (!value || typeof value !== "string") return false;

    try {
      // CryptoJS encrypted strings typically contain specific patterns
      // Check for base64-like pattern and try decryption
      const hasEncryptionPattern =
        value.includes("U2FsdGVkX1") || /^[A-Za-z0-9+/]+=*$/.test(value);

      if (!hasEncryptionPattern) return false;

      // Try to decrypt and see if we get meaningful result
      const decrypted = CryptoJS.AES.decrypt(
        value,
        this.ENCRYPTION_KEY,
      ).toString(CryptoJS.enc.Utf8);

      // If decryption succeeds and returns non-empty string, it's likely encrypted
      return decrypted.length > 0;
    } catch (error) {
      return false;
    }
  }
}
