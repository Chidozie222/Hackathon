import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Get encryption key from environment or generate default (should be in .env.local)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-min-32-chars-long';

/**
 * Derives a key from the master key using PBKDF2
 */
function deriveKey(salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts sensitive data (BVN, NIN, etc.)
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: salt:iv:encrypted:tag
 */
export function encryptSensitiveData(text: string): string {
    try {
        // Generate random salt and IV
        const salt = crypto.randomBytes(SALT_LENGTH);
        const iv = crypto.randomBytes(IV_LENGTH);
        
        // Derive key from master key
        const key = deriveKey(salt);
        
        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        // Encrypt the text
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Get authentication tag
        const tag = cipher.getAuthTag();
        
        // Return as combined string: salt:iv:encrypted:tag
        return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt sensitive data');
    }
}

/**
 * Decrypts sensitive data
 * @param encryptedData - Encrypted string in format: salt:iv:encrypted:tag
 * @returns Decrypted plain text
 */
export function decryptSensitiveData(encryptedData: string): string {
    try {
        // Split the encrypted data
        const parts = encryptedData.split(':');
        if (parts.length !== 4) {
            throw new Error('Invalid encrypted data format');
        }
        
        const salt = Buffer.from(parts[0], 'hex');
        const iv = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        const tag = Buffer.from(parts[3], 'hex');
        
        // Derive the same key
        const key = deriveKey(salt);
        
        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        
        // Decrypt
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt sensitive data');
    }
}

/**
 * Hashes sensitive data for comparison without decryption
 * Useful for verification without exposing original data
 */
export function hashSensitiveData(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Masks sensitive data for display (shows only last 4 digits)
 */
export function maskSensitiveData(text: string): string {
    if (!text || text.length < 4) return '****';
    return '*'.repeat(text.length - 4) + text.slice(-4);
}
