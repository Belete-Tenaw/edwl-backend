const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logAction } = require('../services/auditService');
const referralController = require('./referralController');
const { calculateWorkerRank } = require('../utils/rankLogic');

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

        let formattedPhone = phone;
        if (phone) {
            const trimmed = phone.trim().replace(/\s+/g, '');
            // Simple server-side validation/normalization
            if (/^(09|07)\d{8}$/.test(trimmed)) {
                formattedPhone = '+251' + trimmed.substring(1);
            } else if (/^\+251[79]\d{8}$/.test(trimmed)) {
                formattedPhone = trimmed;
            } else if (!/^\+\d{7,15}$/.test(trimmed)) {
                return res.status(400).json({ error: "Invalid phone number format. Use 09... or +countrycode..." });
            } else {
                formattedPhone = trimmed;
            }
        }

        const photo = req.files && req.files['profilePhoto']
            ? req.files['profilePhoto'][0].path.replace(/\\/g, '/')
            : null;

        const idDoc = req.files && req.files['idDocument']
            ? req.files['idDocument'][0].path.replace(/\\/g, '/')
            : null;

        const natId = req.files && req.files['nationalIdUrl']
            ? req.files['nationalIdUrl'][0].path.replace(/\\/g, '/')
            : null;

        const guarId = req.files && req.files['guarantorIdUrl']
            ? req.files['guarantorIdUrl'][0].path.replace(/\\/g, '/')
            : null;

        const policeClr = req.files && req.files['policeClearanceUrl']
            ? req.files['policeClearanceUrl'][0].path.replace(/\\/g, '/')
            : null;

        const healthCert = req.files && req.files['healthCertificateUrl']
            ? req.files['healthCertificateUrl'][0].path.replace(/\\/g, '/')
            : null;

        const videoBioPath = req.files && req.files['videoBio']
            ? req.files['videoBio'][0].path.replace(/\\/g, '/')
            : null;

        // Rank Enforcement: Mandatory Bronze requirements
        if (!photo || !idDoc) {
            return res.status(400).json({ error: "Profile photo and ID document (Kebele/Passport) are mandatory for registration." });
        }

        const existingSeeker = await prisma.jobSeeker.findUnique({
            where: { email: email || '' }
        });
        if (existingSeeker) {
            return res.status(409).json({ message: "An account with this email already exists. Please log in instead." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const myReferralCode = await referralController.generateReferralCode(fullName);

        const newSeeker = await prisma.jobSeeker.create({
            data: {
                fullName,
                email,
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

        const seeker = await prisma.jobSeeker.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
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

        let formattedPhone = phone;
        if (phone) {
            const trimmed = phone.trim().replace(/\s+/g, '');
            if (/^(09|07)\d{8}$/.test(trimmed)) {
                formattedPhone = '+251' + trimmed.substring(1);
            } else if (/^\+251[79]\d{8}$/.test(trimmed)) {
                formattedPhone = trimmed;
            } else if (!/^\+\d{7,15}$/.test(trimmed)) {
                return res.status(400).json({ error: "Invalid phone number format. Use 09... or +countrycode..." });
            } else {
                formattedPhone = trimmed;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const myReferralCode = await referralController.generateReferralCode(contactName);

        const existingEmployer = await prisma.employer.findUnique({ where: { email } });
        if (existingEmployer) {
            return res.status(409).json({ message: "An account with this email already exists. Please log in instead." });
        }

        const newEmployer = await prisma.employer.create({
            data: {
                contactName,
                email,
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

        const employer = await prisma.employer.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
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
