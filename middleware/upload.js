// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Создаем директорию для логотипов если её нет
const logoDir = path.join(__dirname, '../public/images/logos');
if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
}

// Настройка хранения
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, logoDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `logo-${uniqueSuffix}${ext}`);
    }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый формат изображения. Используйте JPG, PNG, WEBP или GIF'), false);
    }
};

// Создаем multer экземпляр
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: fileFilter
});

// Оптимизация изображения после загрузки
const optimizeImage = async (filePath, outputPath) => {
    try {
        await sharp(filePath)
            .resize(200, 200, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(outputPath);
        
        // Удаляем оригинал
        fs.unlinkSync(filePath);
        
        return outputPath;
    } catch (err) {
        console.error('Image optimization error:', err);
        return filePath;
    }
};

// Middleware для обработки загрузки логотипа
const uploadLogo = (req, res, next) => {
    upload.single('logo')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        if (req.file) {
            const webpPath = path.join(logoDir, `${path.parse(req.file.filename).name}.webp`);
            const optimizedPath = await optimizeImage(req.file.path, webpPath);
            req.file.filename = path.basename(optimizedPath);
            req.file.path = optimizedPath;
        }
        
        next();
    });
};

// Удаление старого логотипа
const deleteOldLogo = (logoPath) => {
    if (logoPath && logoPath !== '/images/logos/default.png') {
        const fullPath = path.join(__dirname, '../public', logoPath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
};

module.exports = { uploadLogo, deleteOldLogo };