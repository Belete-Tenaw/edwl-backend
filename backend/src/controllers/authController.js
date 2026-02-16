// Correct way to get the path from Multer upload.fields()
const idDoc = req.files['idDocument'] ? req.files['idDocument'][0].path.replace(/\\/g, '/') : null;
const photo = req.files['profilePhoto'] ? req.files['profilePhoto'][0].path.replace(/\\/g, '/') : null;

// Then save 'idDoc' and 'photo' to your Prisma create call