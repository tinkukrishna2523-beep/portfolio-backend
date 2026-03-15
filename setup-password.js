/**
 * Run this ONCE to generate your admin password hash.
 *
 * Usage:
 *   node setup-password.js yourPasswordHere
 *
 * Then copy the hash into your .env file as ADMIN_PASSWORD_HASH
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('\n❌  Please provide a password:\n');
  console.error('    node setup-password.js yourPasswordHere\n');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('\n✅  Password hashed successfully!\n');
  console.log('Copy this line into your backend/.env file:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
}).catch(err => {
  console.error('Error hashing password:', err);
});
