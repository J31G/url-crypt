// Initialize with a 43 char base64 password.  Google 'password generator'
const urlCrypt = require('url-crypt')('$xrRB9H6NMA3PpQGtfbnrqP$H@H$Xr?A');

// Get some data
const data = { hello: 'world', this: 'is a test', of: 'url-crypt' };
console.log(data);

// Encrypt your data
const base64 = urlCrypt.cryptObj(data);
console.log(base64);

// Give it to someone.  It's encrypted so they can't tamper with it

// Get it back
const backAgain = urlCrypt.decryptObj(base64);
console.log(backAgain);

// Expectations
// expect(backAgain).to.eql(data);
