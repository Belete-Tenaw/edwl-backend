/**
 * ============================================================
 *  EDWL — SECURE ADMIN PASSWORD CHANGE SCRIPT
 * ============================================================
 *
 * USAGE:
 *   node change_admin_password.js <username> <new_password>
 *
 * RULES:
 *   • Password must be at least 12 characters
 *   • Must contain uppercase, lowercase, a number, and a symbol
 *   • The plaintext password is NEVER logged or stored
 *   • Uses bcrypt with 12 salt rounds (extra hardening for admin)
 *
 * EXAMPLE:
 *   node change_admin_password.js EDWL_Admin  MyN3w$ecure!Pass
 *
 * ============================================================
 */

require('dotenv').config();
const prisma = require('./src/utils/prisma');
const bcrypt = require('bcrypt');

// Password strength requirements
const PASSWORD_MIN_LENGTH = 12;
const BCRYPT_ROUNDS = 12; // Higher than regular users (10) for extra admin security

function validatePasswordStrength(password) {
    const errors = [];

    if (password.length < PASSWORD_MIN_LENGTH) {
        errors.push(`Must be at least ${PASSWORD_MIN_LENGTH} characters long`);
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Must contain at least one uppercase letter (A-Z)');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Must contain at least one lowercase letter (a-z)');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Must contain at least one number (0-9)');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push('Must contain at least one symbol (!@#$%^&* etc.)');
    }

    return errors;
}

async function changeAdminPassword() {
    const username = process.argv[2];
    const newPassword = process.argv[3];

    // --- Validate arguments ---
    if (!username || !newPassword) {
        console.error('\n❌ Error: Missing arguments.');
        console.log('\n📋 Usage:   node change_admin_password.js <username> <new_password>');
        console.log('📋 Example: node change_admin_password.js EDWL_Admin MyN3w$ecure!Pass\n');
        process.exit(1);
    }

    // --- Validate password strength ---
    const strengthErrors = validatePasswordStrength(newPassword);
    if (strengthErrors.length > 0) {
        console.error('\n❌ Password does not meet security requirements:');
        strengthErrors.forEach(e => console.error(`   • ${e}`));
        console.log('');
        process.exit(1);
    }

    try {
        // --- Check admin exists ---
        const admin = await prisma.admin.findUnique({
            where: { username },
            select: { id: true, username: true, role: true }
        });

        if (!admin) {
            console.error(`\n❌ Error: Admin account "${username}" not found in the database.`);
            console.log('   Tip: Run "node check_admin.js" to list existing admin accounts.\n');
            process.exit(1);
        }

        console.log('\n🔐 Admin account found:');
        console.log(`   Username : ${admin.username}`);
        console.log(`   Role     : ${admin.role}`);
        console.log(`   ID       : ${admin.id}`);
        console.log('\n⏳ Hashing new password (bcrypt, 12 rounds)...');

        // --- Hash the new password ---
        const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        // --- Update in database ---
        await prisma.admin.update({
            where: { username },
            data: { password: hashedPassword }
        });

        // --- Done ---
        console.log('\n==================================================');
        console.log('✅ SUCCESS: Admin password updated securely!');
        console.log('==================================================');
        console.log('');
        console.log('🔒 Security reminders:');
        console.log('   1. The plaintext password was NOT saved anywhere.');
        console.log('   2. Store your new password in a password manager.');
        console.log('   3. Clear your terminal history after this command.');
        console.log('   4. All existing JWT tokens remain valid for 24h.');
        console.log('      To force immediate logout of all sessions, rotate');
        console.log('      your JWT_SECRET in .env and restart the server.');
        console.log('');

    } catch (error) {
        console.error('\n❌ Unexpected error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

changeAdminPassword();
