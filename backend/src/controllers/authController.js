const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Correct way to get the path from Multer upload.fields() 
        // These are now inside the function, so 'req' is defined!
        const idDoc = req.files && req.files['idDocument'] 
            ? req.files['idDocument'][0].path.replace(/\\/g, '/') 
            : null;
            
        const photo = req.files && req.files['profilePhoto'] 
            ? req.files['profilePhoto'][0].path.replace(/\\/g, '/') 
            : null;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in database
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'USER',
                idDocument: idDoc, // Saving the path we grabbed above
                profilePhoto: photo // Saving the path we grabbed above
            }
        });

        res.status(201).json({ message: "User registered successfully", userId: newUser.id });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};
