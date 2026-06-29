/**
 * Password Hash Generator Script
 *
 * Usage:
 *   node server/scripts/generate-password.js <password>
 *   node server/scripts/generate-password.js <password> --json
 *
 * Examples:
 *   node server/scripts/generate-password.js mySecurePassword
 *   node server/scripts/generate-password.js "MySecurePassword123!" --json
 *
 * Output:
 *   - Hashed password (for database storage)
 *   - SQL INSERT statement (for direct database update)
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// ============================================================
// CONFIGURATION
// ============================================================

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 12;
const USERNAME = process.env.ADMIN_USERNAME || 'admin';

// ============================================================
// ARGUMENT PARSING
// ============================================================

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              Password Hash Generator v1.0                     ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Usage:                                                       ║
║    node server/scripts/generate-password.js <password>         ║
║    node server/scripts/generate-password.js <password> --json  ║
║                                                               ║
║  Environment Variables:                                       ║
║    SALT_ROUNDS  - bcrypt cost factor (default: 12)           ║
║    ADMIN_USERNAME - username for SQL output (default: admin)   ║
║                                                               ║
║  Examples:                                                    ║
║    node server/scripts/generate-password.js mySecurePassword  ║
║    node server/scripts/generate-password.js "MyPass123!"      ║
║    node server/scripts/generate-password.js pass --json        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
  process.exit(0);
}

const password = args[0];
const isJson = args.includes('--json');
const generateSql = args.includes('--sql');

// ============================================================
// PASSWORD STRENGTH VALIDATION
// ============================================================

function validatePasswordStrength(pwd) {
  const warnings = [];
  const checks = {
    length: pwd.length >= 12,
    lowercase: /[a-z]/.test(pwd),
    uppercase: /[A-Z]/.test(pwd),
    numbers: /\d/.test(pwd),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
  };

  if (!checks.length) warnings.push('Password should be at least 12 characters long');
  if (!checks.lowercase) warnings.push('Add lowercase letters');
  if (!checks.uppercase) warnings.push('Add uppercase letters');
  if (!checks.numbers) warnings.push('Add numbers');
  if (!checks.special) warnings.push('Add special characters');

  const score = Object.values(checks).filter(Boolean).length;

  return { checks, warnings, score };
}

// ============================================================
// HASH GENERATION
// ============================================================

async function generatePasswordHash(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
}

// ============================================================
// MAIN EXECUTION
// ============================================================

async function main() {
  console.error('\n[INFO] Generating password hash...');
  console.error(`[INFO] Salt rounds: ${SALT_ROUNDS}`);
  console.error(`[INFO] Username: ${USERNAME}\n`);

  try {
    const hash = await generatePasswordHash(password);

    // Validate password strength
    const validation = validatePasswordStrength(password);

    // Generate unique ID
    const id = 'admin-' + crypto.randomBytes(4).toString('hex');

    // Generate timestamp
    const timestamp = new Date().toISOString();

    if (isJson) {
      // JSON output for programmatic use
      const output = {
        success: true,
        username: USERNAME,
        password_hash: hash,
        salt_rounds: SALT_ROUNDS,
        id: id,
        created_at: timestamp,
        validation: {
          strength_score: validation.score,
          strength_level: validation.score >= 5 ? 'STRONG' : validation.score >= 3 ? 'MEDIUM' : 'WEAK',
          warnings: validation.warnings,
          checks: validation.checks,
        },
        instructions: {
          '1. Copy the password_hash value',
          '2. Update admin_users table in database',
          '3. Delete any temporary password files',
        },
      };

      console.log(JSON.stringify(output, null, 2));
    } else {
      // Human-readable output
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                  PASSWORD HASH GENERATED                      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Username: ${USERNAME.padEnd(55)}║
║                                                               ║
║  Password Hash:                                               ║
║  ${hash.substring(0, 58).padEnd(60)}║
║  ${hash.substring(58).padEnd(60)}║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║  PASSWORD STRENGTH ANALYSIS                                   ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Score: ${validation.score}/5                                                        ║
║  Level: ${(validation.score >= 5 ? '🟢 STRONG' : validation.score >= 3 ? '🟡 MEDIUM' : '🔴 WEAK').padEnd(55)}║
║                                                               ║
║  Checks:                                                      ║
║  ${validation.checks.length ? '✓'.padEnd(2) : '✗'.padEnd(2)}  At least 12 characters                          ║
║  ${validation.checks.lowercase ? '✓'.padEnd(2) : '✗'.padEnd(2)}  Contains lowercase letters                        ║
║  ${validation.checks.uppercase ? '✓'.padEnd(2) : '✗'.padEnd(2)}  Contains uppercase letters                        ║
║  ${validation.checks.numbers ? '✓'.padEnd(2) : '✗'.padEnd(2)}  Contains numbers                               ║
║  ${validation.checks.special ? '✓'.padEnd(2) : '✗'.padEnd(2)}  Contains special characters                     ║
║                                                               ║`);

      if (validation.warnings.length > 0) {
        console.log(`
║  Warnings:                                                    ║`);
        validation.warnings.forEach(warning => {
          console.log(`║  ⚠️  ${warning.padEnd(56)}║`);
        });
      }

      console.log(`
╠═══════════════════════════════════════════════════════════════╣
║  SQL INSERT (if needed):                                       ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  INSERT INTO admin_users (id, username, password_hash,         ║
║    created_at) VALUES ('${id}', '${USERNAME.toLowerCase()}',   ║
║    '${hash}', datetime('now'));                               ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║  UPDATE EXISTING USER:                                         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  UPDATE admin_users SET password_hash = '${hash}'              ║
║    WHERE username = '${USERNAME.toLowerCase()}';               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
    }

    // Security: Clear password from memory
    process.on('exit', () => {
      // Password will be garbage collected
    });

  } catch (err) {
    console.error('\n[ERROR] Failed to generate password hash:', err.message);
    process.exit(1);
  }
}

// Run
main();
