import crypto from 'crypto';

class HealthDataEncryption {
  constructor() {
    // In production, use environment variables for encryption keys
    this.algorithm = 'aes-256-gcm';
    this.secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    this.ivLength = 16;
    this.tagLength = 16;
  }

  // Encrypt sensitive health data
  encrypt(text) {
    try {
      if (!text) return null;
      
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.secretKey);
      cipher.setAAD(Buffer.from('health-data', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt health data');
    }
  }

  // Decrypt sensitive health data
  decrypt(encryptedData) {
    try {
      if (!encryptedData || !encryptedData.encrypted) return null;
      
      const { encrypted, iv, tag } = encryptedData;
      const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
      
      decipher.setAAD(Buffer.from('health-data', 'utf8'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt health data');
    }
  }

  // Encrypt specific fields in an object
  encryptFields(obj, fieldsToEncrypt) {
    const encryptedObj = { ...obj };
    
    fieldsToEncrypt.forEach(field => {
      if (encryptedObj[field]) {
        encryptedObj[field] = this.encrypt(encryptedObj[field].toString());
      }
    });
    
    return encryptedObj;
  }

  // Decrypt specific fields in an object
  decryptFields(obj, fieldsToDecrypt) {
    const decryptedObj = { ...obj };
    
    fieldsToDecrypt.forEach(field => {
      if (decryptedObj[field]) {
        decryptedObj[field] = this.decrypt(decryptedObj[field]);
      }
    });
    
    return decryptedObj;
  }

  // Hash sensitive identifiers (not reversible)
  hash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  // Generate secure random token
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

// Create singleton instance
const healthEncryption = new HealthDataEncryption();

export default healthEncryption;
