// Encrypt all the cookies and shit that will be exposed to user and reused internally

import { CipherGCMTypes, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Don't you dare export this key, go get your own instead of being a copycat.
const masterKey = randomBytes(32); // Remember, this is used internally so the key value shouldn't matter. It also decreases your security if the key is hardcoded.

const cryptoAlg : CipherGCMTypes = "aes-256-gcm"; // You have to declear the type otherwise I'll use the default crypto type which doesn't have getAuthTag() smh


export const encrypt = (data : Buffer | string): Buffer => {
    // Convert data to Buffer if it's a string
    if(typeof data === "string") data = Buffer.from(data);
    // Generate a random IV
    const randIV = randomBytes(12); // We're following the standard implementation for AES-GCM which uses 96-bit IV size (https://dl.acm.org/doi/pdf/10.5555/2206251)
    // Start Encrypting the data
    const cipher = createCipheriv(cryptoAlg,masterKey,randIV);
    const cipherData = Buffer.concat([cipher.update(data),cipher.final()]);
    return Buffer.concat([randIV, cipherData, cipher.getAuthTag()]);
}
export const decrypt = (cipherData : Buffer | string): Buffer => {
    // Convert cipherData to Buffer if it's a string
    if(typeof cipherData === "string") cipherData = Buffer.from(cipherData);
    // Extract each individual data from the concatenated buffer
    const IV = cipherData.slice(0, 12);
    const Data = cipherData.slice(12, cipherData.length-28);
    const Tag = cipherData.slice(cipherData.length-28,cipherData.length);
    // Start Decrypting the data
    const decipher = createDecipheriv(cryptoAlg,masterKey,IV);
    decipher.setAuthTag(Tag);
    return Buffer.concat([decipher.update(Data), decipher.final()]);
}