// Include crypto & zlib module
const crypto = require('crypto');
const zlib = require('zlib');

// Include URL safe base64 strings
const { encode, decode } = require('js-base64');

/**
 * Creates a urlCrypte encoder/decoder.
 *
 * const urlCrypt = require('./updated')('$xrRB9H6NMA3PpQGtfbnrqP$H@H$Xr?A') // sensible defaults
 *
 * const data = { hello: 'world', this: 'is a test', of: 'url-crypt' };
 * const base64 = urlCrypt.cryptObj(data);
 * const backAgain = urlCrypt.decryptObj(base64);
 * expect(backAgain).to.eql(data);
 *
 * @param  {string} key         super secret random string
 * @return {object}             object with cryptObj() and decryptObj()
 */
module.exports = (password) => {
  // Configuration
  const urlCrypt = {
    password,
    algorithm: 'aes-256-cbc',
  };

  // Check password length
  if (password.length !== 32) {
    throw new Error(
      "Please use a 32 character strong password and don't be lazy.",
    );
  }

  /**
   * Encrypt a Javascript object.
   *
   * Obj -> json -> [gzip] -> [aes-256-cbc] -> urlsafe-base64
   *
   * @param  {object} pojo Object to JSON.stringify()
   * @return {string}      urlsafe-base64 of encrypted object.
   */
  urlCrypt.cryptObj = (pojo) => {
    // Make JSON
    const data = JSON.stringify(pojo);

    // Compress data w/ GZip
    const gzip = zlib.gzipSync(data);

    // Defining iv
    const iv = crypto.randomBytes(16);

    // Creating Cipheriv with its parameter
    const cipher = crypto.createCipheriv(
      urlCrypt.algorithm,
      Buffer.from(urlCrypt.password),
      iv,
    );

    // Updating text
    let encrypted = cipher.update(gzip);

    // Using concatenation
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Return base64 encoded iv and encrypted data
    return encode(`${iv.toString('hex')}+${encrypted.toString('hex')}`, true);
  };

  /**
   * Decrypt a Javascript object.
   *
   * Obj <- json <- [gzip] <- [aes-256-cbc] <- urlsafe-base64
   *
   * @param  {string} urlSafeBase64 string to decrypt
   * @return {object}               we're back!
   */
  urlCrypt.decryptObj = (urlSafeBase64) => {
    // decode base64 and split on '+'
    const decoded = decode(urlSafeBase64).split('+');

    // Extract iv from decoded string
    const iv = Buffer.from(decoded[0], 'hex');

    // Extract text from decoded string
    const encryptedText = Buffer.from(decoded[1], 'hex');

    // Creating Decipher
    const decipher = crypto.createDecipheriv(
      urlCrypt.algorithm,
      Buffer.from(urlCrypt.password),
      iv,
    );

    // Updating encrypted text
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // Decompress
    decrypted = zlib.gunzipSync(decrypted);

    // convert to buffer to string
    const data = decrypted.toString('utf8');

    // Parse and return
    const ret = JSON.parse(data);
    return ret;
  };

  return urlCrypt;
};
