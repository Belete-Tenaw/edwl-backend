const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logAction } = require('../services/auditService');
const referralController = require('./referralController');
const { calculateWorkerRank } = require('../utils/rankLogic');
const { uploadFileToFirebase } = require('../services/firebaseStorageService');
const { normalizeEmail, normalizePhone } = require('../utils/validation');
const crypto = require('crypto');

// =============================
// HELPERS
// =============================
// Removed local calculateSeekerTier as it's now handled by calculateWorkerRank in utils

// =============================
// JOB SEEKER REGISTER
// =============================
exports.registerJobSeeker = async (req, res, next) => {
    try {
        const {
            fullName, email, password, phone, gender,
            age, maritalStatus, expectedSalary,
            preferredLocation, preferredArrangement,
            experienceYears, skills, bio, guarantorPhone,
            passwordHint, securityQuestion, securityAnswer,
            referralCodeUsed
        } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        let formattedPhone = normalizePhone(phone);
        if (phone && !formattedPhone) {
            return res.status(400).json({ error: "Invalid phone number format. Use 09... or +countrycode..." });
        }

        const photoFile = req.files && req.files['profilePhoto'] ? req.files['profilePhoto'][0] : null;
        const idDocFile = req.files && req.files['idDocument'] ? req.files['idDocument'][0] : null;

        // Rank Enforcement: Mandatory Bronze requirements
        if (!photoFile || !idDocFile) {
            return res.status(400).json({ error: "Profile photo and ID document (Kebele/Passport) are mandatory for registration." });
        }

        // Duplicate detection: phone (new) and email (case-insensitive)
        if (formattedPhone) {
            const existingByPhone = await prisma.jobSeeker.findFirst({ where: { phone: formattedPhone } });
            if (existingByPhone) {
                return res.status(409).json({
                    duplicateField: 'phone',
                    message: "This phone number is already registered in EDWL. If this is your account, please log in. If you forgot your password, you can reset it."
                });
            }
        }
        const normalizedEmail = normalizeEmail(email);
        if (normalizedEmail) {
            const existingByEmail = await prisma.jobSeeker.findFirst({ where: { email: normalizedEmail } });
            if (existingByEmail) {
                return res.status(409).json({
                    duplicateField: 'email',
                    message: "This email address is already registered in EDWL. If this is your account, please log in. If you forgot your password, you can reset it."
                });
            }
        }

        let photo, idDoc, natId, guarId, policeClr, healthCert, videoBioPath;

        try {
            // Upload mandatory files first
            photo = (await uploadFileToFirebase(photoFile, 'profile-photos', true)).publicUrl;
            idDoc = (await uploadFileToFirebase(idDocFile, 'legal-docs', false)).storagePath;

            // Upload optional files
            const natIdFile = req.files && req.files['nationalIdUrl'] ? req.files['nationalIdUrl'][0] : null;
            if (natIdFile) natId = (await uploadFileToFirebase(natIdFile, 'legal-docs', false)).storagePath;

            const guarIdFile = req.files && req.files['guarantorIdUrl'] ? req.files['guarantorIdUrl'][0] : null;
            if (guarIdFile) guarId = (await uploadFileToFirebase(guarIdFile, 'legal-docs', false)).storagePath;

            const policeClrFile = req.files && req.files['policeClearanceUrl'] ? req.files['policeClearanceUrl'][0] : null;
            if (policeClrFile) policeClr = (await uploadFileToFirebase(policeClrFile, 'legal-docs', false)).storagePath;

            const healthCertFile = req.files && req.files['healthCertificateUrl'] ? req.files['healthCertificateUrl'][0] : null;
            if (healthCertFile) healthCert = (await uploadFileToFirebase(healthCertFile, 'legal-docs', false)).storagePath;

            const videoBioFile = req.files && req.files['videoBio'] ? req.files['videoBio'][0] : null;
            if (videoBioFile) videoBioPath = (await uploadFileToFirebase(videoBioFile, 'profile-videos', true)).publicUrl;
        } catch (uploadError) {
            console.error("Firebase upload failed:", uploadError);
            return res.status(500).json({ error: "Failed to upload documents. Please try again." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const myReferralCode = await referralController.generateReferralCode(fullName);

        const newSeeker = await prisma.jobSeeker.create({
            data: {
                fullName,
                email: normalizedEmail,
                phone: formattedPhone,
                password: hashedPassword,
                passwordHint,
                securityQuestion,
                securityAnswer,
                gender: gender || 'FEMALE',
                age: parseInt(age) || 20,
                maritalStatus: maritalStatus || 'SINGLE',
                expectedSalary: parseInt(expectedSalary) || 0,
                preferredLocation: preferredLocation || 'Addis Ababa',
                preferredArrangement: preferredArrangement || 'LIVE_IN',
                experienceYears: parseInt(experienceYears) || 0,
                skills: skills ? (Array.isArray(skills) ? skills : [skills]) : [],
                bio: bio || '',
                profilePhoto: photo || '', // Required field
                idDocument: idDoc,
                nationalIdUrl: natId,
                guarantorIdUrl: guarId,
                guarantorPhone: guarantorPhone,
                policeClearanceUrl: policeClr,
                healthCertificateUrl: healthCert,
                videoBio: videoBioPath,
                tier: calculateWorkerRank({
                    profilePhoto: photo,
                    idDocument: idDoc,
                    nationalIdUrl: natId,
                    guarantorIdUrl: guarId,
                    guarantorPhone: guarantorPhone,
                    policeClearanceUrl: policeClr,
                    healthCertificateUrl: healthCert
                }),
                referralCode: myReferralCode
            }
        });

        // Track referral if used
        if (referralCodeUsed) {
            await referralController.trackReferral(referralCodeUsed, 'seeker', newSeeker.id);
        }

        res.status(201).json({ message: "Job Seeker registered successfully", userId: newSeeker.id });

        // Audit Log
        await logAction('REGISTER_SEEKER', newSeeker.id, 'JOB_SEEKER', { fullName: newSeeker.fullName });

    } catch (error) {
        console.error("Seeker Registration error:", error);

        // Let the global error handler handle the response formatting
        return next(error);
    }
};

// =============================
// JOB SEEKER LOGIN
// =============================
exports.loginJobSeeker = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        
        if (!identifier || !password) {
            return res.status(400).json({ error: "Identifier and password are required." });
        }

        const normalizedIdentifier = identifier && typeof identifier === 'string' && identifier.includes('@') 
            ? normalizeEmail(identifier) 
            : normalizePhone(identifier);

        const seeker = await prisma.jobSeeker.findFirst({
            where: {
                OR: [
                    { email: normalizedIdentifier },
                    { phone: normalizedIdentifier }
                ]
            }
        });

        if (!seeker) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, seeker.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Just-in-Time Referral Code Generation for existing users
        if (!seeker.referralCode) {
            seeker.referralCode = await referralController.generateReferralCode(seeker.fullName);
            await prisma.jobSeeker.update({
                where: { id: seeker.id },
                data: { referralCode: seeker.referralCode }
            });
        }

        if (!seeker.isActive) {
            return res.status(403).json({ error: "Your account has been suspended. Please contact support." });
        }

        const token = jwt.sign(
            { id: seeker.id, role: 'JOB_SEEKER' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { id: seeker.id, name: seeker.fullName, role: 'JOB_SEEKER', referralCode: seeker.referralCode, referralCount: seeker.referralCount }
        });

        // Audit Log
        await logAction('LOGIN_SEEKER', seeker.id, 'JOB_SEEKER');

    } catch (error) {
        console.error("Seeker Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

// =============================
// EMPLOYER REGISTER
// =============================
exports.registerEmployer = async (req, res, next) => {
    try {
        const { contactName, email, password, phone, employerType, address, passwordHint, securityQuestion, securityAnswer, referralCodeUsed } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        let formattedPhone = normalizePhone(phone);
        if (phone && !formattedPhone) {
            return res.status(400).json({ error: "Invalid phone number format. Use 09... or +countrycode..." });
        }

        // Duplicate detection: phone (new) and email (case-insensitive)
        if (formattedPhone) {
            const existingByPhone = await prisma.employer.findFirst({ where: { phone: formattedPhone } });
            if (existingByPhone) {
                return res.status(409).json({
                    duplicateField: 'phone',
                    message: "This phone number is already registered in EDWL. If this is your account, please log in. If you forgot your password, you can reset it."
                });
            }
        }
        const normalizedEmail = normalizeEmail(email);
        if (normalizedEmail) {
            const existingByEmail = await prisma.employer.findFirst({ where: { email: normalizedEmail } });
            if (existingByEmail) {
                return res.status(409).json({
                    duplicateField: 'email',
                    message: "This email address is already registered in EDWL. If this is your account, please log in. If you forgot your password, you can reset it."
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const myReferralCode = await referralController.generateReferralCode(contactName);

        const newEmployer = await prisma.employer.create({
            data: {
                contactName,
                email: normalizedEmail,
                phone: formattedPhone,
                password: hashedPassword,
                passwordHint,
                securityQuestion,
                securityAnswer,
                employerType: employerType || 'HOUSEHOLD',
                address: address || 'Addis Ababa',
                referralCode: myReferralCode
            }
        });

        // Track referral if used
        if (referralCodeUsed) {
            await referralController.trackReferral(referralCodeUsed, 'employer', newEmployer.id);
        }

        res.status(201).json({
            message: "Employer registered successfully",
            userId: newEmployer.id
        });

        // Audit Log
        await logAction('REGISTER_EMPLOYER', newEmployer.id, 'EMPLOYER', { contactName: newEmployer.contactName });

    } catch (error) {
        console.error("Employer Registration error:", error);

        // Let the global error handler handle the response formatting
        return next(error);
    }
};

// =============================
// EMPLOYER LOGIN
// =============================
exports.loginEmployer = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: "Identifier and password are required." });
        }

        const normalizedIdentifier = identifier && typeof identifier === 'string' && identifier.includes('@') 
            ? normalizeEmail(identifier) 
            : normalizePhone(identifier);

        const employer = await prisma.employer.findFirst({
            where: {
                OR: [
                    { email: normalizedIdentifier },
                    { phone: normalizedIdentifier }
                ]
            }
        });

        if (!employer) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, employer.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Just-in-Time Referral Code Generation for existing users
        if (!employer.referralCode) {
            employer.referralCode = await referralController.generateReferralCode(employer.contactName);
            await prisma.employer.update({
                where: { id: employer.id },
                data: { referralCode: employer.referralCode }
            });
        }

        if (!employer.isActive) {
            return res.status(403).json({ error: "Your account has been suspended. Please contact support." });
        }

        const token = jwt.sign(
            { id: employer.id, role: 'EMPLOYER' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { id: employer.id, name: employer.contactName, role: 'EMPLOYER', referralCode: employer.referralCode, referralCount: employer.referralCount }
        });

        // Audit Log
        await logAction('LOGIN_EMPLOYER', employer.id, 'EMPLOYER');

    } catch (error) {
        console.error("Employer Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

// =============================
// ADMIN LOGIN
// =============================
exports.loginAdmin = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const loginUsername = username || email; // Frontend sends 'username', support both

        const admin = await prisma.admin.findFirst({
            where: {
                username: loginUsername
            }
        });

        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin.id, role: 'ADMIN', adminRole: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { id: admin.id, name: admin.username, role: 'ADMIN', adminRole: admin.role }
        });

        // Audit Log
        await logAction('LOGIN_ADMIN', admin.id, 'ADMIN');

    } catch (error) {
        console.error("Admin Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

// =============================
// FIREBASE LOGIN
// =============================
exports.firebaseLogin = async (req, res) => {
    res.status(200).json({ message: "Firebase login endpoint active" });
};

// =============================
// CHECK DUPLICATE (pre-flight)
// =============================
exports.checkDuplicate = async (req, res) => {
    try {
        const { phone, email, role } = req.query;
        // role can be 'seeker' or 'employer' (default: check both)

        let formattedPhone = normalizePhone(phone);
        const normalizedEmail = normalizeEmail(email);

        let exists = false;

        if (role === 'employer') {
            if (formattedPhone) {
                const r = await prisma.employer.findFirst({ where: { phone: formattedPhone } });
                if (r) exists = true;
            }
            if (!exists && normalizedEmail) {
                const r = await prisma.employer.findFirst({ where: { email: normalizedEmail } });
                if (r) exists = true;
            }
        } else {
            // default: seeker
            if (formattedPhone) {
                const r = await prisma.jobSeeker.findFirst({ where: { phone: formattedPhone } });
                if (r) exists = true;
            }
            if (!exists && normalizedEmail) {
                const r = await prisma.jobSeeker.findFirst({ where: { email: normalizedEmail } });
                if (r) exists = true;
            }
        }

        return res.status(200).json({ exists });
    } catch (error) {
        console.error('checkDuplicate error:', error);
        return res.status(500).json({ error: 'Check failed' });
    }
};

// =============================
// FORGOT PASSWORD
// =============================
exports.forgotPassword = async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier) return res.status(400).json({ error: "Email or phone is required" });

        const normalized = identifier.includes('@') ? normalizeEmail(identifier) : normalizePhone(identifier);
        
        // Check both seeker and employer
        let user = await prisma.jobSeeker.findFirst({ where: { OR: [{ email: normalized }, { phone: normalized }] } });
        let userType = 'seeker';
        
        if (!user) {
            user = await prisma.employer.findFirst({ where: { OR: [{ email: normalized }, { phone: normalized }] } });
            userType = 'employer';
        }

        if (!user) {
            // Security best practice: don't reveal if user exists, but for UX we might want to
            return res.status(200).json({ message: "If an account exists, a reset link has been sent." });
        }

        const token = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-char OTP
        const expires = new Date(Date.now() + 3600000); // 1 hour

        if (userType === 'seeker') {
            await prisma.jobSeeker.update({
                where: { id: user.id },
                data: { resetPasswordToken: token, resetPasswordExpires: expires }
            });
        } else {
            await prisma.employer.update({
                where: { id: user.id },
                data: { resetPasswordToken: token, resetPasswordExpires: expires }
            });
        }

        const message = `Your EDWL password reset code is: ${token}. It expires in 1 hour.`;
        
        if (user.phone) {
            const { sendSMSAlert } = require('../services/notificationService');
            await sendSMSAlert(user.phone, message);
        } else if (user.email) {
            console.log(`[Email Mock] Sending to ${user.email}: ${message}`);
        }

        return res.status(200).json({ message: "Reset code sent successfully", phone: user.phone ? `******${user.phone.slice(-4)}` : null });
    } catch (error) {
        console.error("Forgot Password error:", error);
        res.status(500).json({ error: "Failed to process request" });
    }
};

// =============================
// RESET PASSWORD
// =============================
exports.resetPassword = async (req, res) => {
    try {
        const { identifier, token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ error: "Token and new password are required" });

        const normalized = identifier.includes('@') ? normalizeEmail(identifier) : normalizePhone(identifier);

        let user = await prisma.jobSeeker.findFirst({ 
            where: { 
                OR: [{ email: normalized }, { phone: normalized }],
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() }
            } 
        });
        let userType = 'seeker';

        if (!user) {
            user = await prisma.employer.findFirst({ 
                where: { 
                    OR: [{ email: normalized }, { phone: normalized }],
                    resetPasswordToken: token,
                    resetPasswordExpires: { gt: new Date() }
                } 
            });
            userType = 'employer';
        }

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (userType === 'seeker') {
            await prisma.jobSeeker.update({
                where: { id: user.id },
                data: { 
                    password: hashedPassword, 
                    resetPasswordToken: null, 
                    resetPasswordExpires: null 
                }
            });
        } else {
            await prisma.employer.update({
                where: { id: user.id },
                data: { 
                    password: hashedPassword, 
                    resetPasswordToken: null, 
                    resetPasswordExpires: null 
                }
            });
        }

        return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Reset Password error:", error);
        res.status(500).json({ error: "Failed to reset password" });
    }
};
