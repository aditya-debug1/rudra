// src/utils/bank-encryption.ts
import * as CryptoJS from "crypto-js";
import { BankDetailsType } from "../models/bank-details";

// Improved helper function to check if data is encrypted
export function isEncrypted(value: string): boolean {
  if (!value || typeof value !== "string") return false;

  // CryptoJS AES encrypted strings start with "U2FsdGVkX1" when using default settings
  // or have a base64-like pattern
  if (value.startsWith("U2FsdGVkX1")) {
    return true;
  }

  // Additional check for base64 pattern (but not too strict to avoid false positives)
  const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
  if (base64Pattern.test(value) && value.length > 20) {
    // Encrypted strings are usually longer
    try {
      // Try to decrypt - if it succeeds and returns meaningful data, it's encrypted
      const decrypted = CryptoJS.AES.decrypt(
        value,
        process.env.ENCRYPTION_KEY ||
          "default-32-char-key-for-development-only",
      ).toString(CryptoJS.enc.Utf8);

      return decrypted.length > 0;
    } catch (error) {
      return false;
    }
  }

  return false;
}

// Helper function to safely decrypt bank details
export function safeDecryptBankDetails(
  bankDetails: BankDetailsType,
): BankDetailsType {
  if (!bankDetails) return bankDetails;

  try {
    const result: BankDetailsType = { ...bankDetails };

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
    return bankDetails;
  }
}

// Transform function for Bank documents (separate collection)
export function transformBankDetailsDocument(doc: any) {
  if (doc) {
    if (isEncrypted(doc.holderName)) {
      doc.holderName = EncryptionUtil.decryptString(doc.holderName);
    }
    if (isEncrypted(doc.accountNumber)) {
      doc.accountNumber = EncryptionUtil.decryptString(doc.accountNumber);
    }
    if (isEncrypted(doc.name)) {
      doc.name = EncryptionUtil.decryptString(doc.name);
    }
    if (isEncrypted(doc.branch)) {
      doc.branch = EncryptionUtil.decryptString(doc.branch);
    }
    if (isEncrypted(doc.ifscCode)) {
      doc.ifscCode = EncryptionUtil.decryptString(doc.ifscCode);
    }
  }
  return doc;
}

// Transform function for projects (kept for compatibility)
export function transformBankDetails(doc: any) {
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

      return decrypted || encryptedValue;
    } catch (error) {
      console.error("String decryption failed:", error);
      return encryptedValue;
    }
  }

  /**
   * Encrypt bank details object
   */
  static encryptBankDetails(data: BankDetailsType): BankDetailsType {
    if (!data) return data;

    try {
      return {
        ...data,
        holderName: this.encryptString(data.holderName),
        accountNumber: this.encryptString(data.accountNumber),
        name: this.encryptString(data.name),
        branch: this.encryptString(data.branch),
        ifscCode: this.encryptString(data.ifscCode),
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
  static decryptBankDetails(encryptedData: BankDetailsType): BankDetailsType {
    if (!encryptedData) return encryptedData;

    try {
      return {
        ...encryptedData,
        holderName: this.decryptString(encryptedData.holderName),
        accountNumber: this.decryptString(encryptedData.accountNumber),
        name: this.decryptString(encryptedData.name),
        branch: this.decryptString(encryptedData.branch),
        ifscCode: this.decryptString(encryptedData.ifscCode),
        accountType: encryptedData.accountType,
      };
    } catch (error) {
      console.error("Bank details decryption failed:", error);
      return encryptedData;
    }
  }

  /**
   * Improved check if a string appears to be encrypted
   */
  static isEncrypted(value: string): boolean {
    if (!value || typeof value !== "string") return false;

    // CryptoJS encrypted strings typically start with "U2FsdGVkX1"
    if (value.startsWith("U2FsdGVkX1")) {
      return true;
    }

    // Additional pattern check with length consideration
    const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
    if (base64Pattern.test(value) && value.length > 20) {
      try {
        const decrypted = CryptoJS.AES.decrypt(
          value,
          this.ENCRYPTION_KEY,
        ).toString(CryptoJS.enc.Utf8);

        return decrypted.length > 0;
      } catch (error) {
        return false;
      }
    }

    return false;
  }
}
