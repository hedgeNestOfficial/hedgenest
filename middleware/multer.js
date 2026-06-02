const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1]
        const fileName = `IMG-${Date.now()}_${Math.floor(Math.random() * 1E10)}.${ext}`
        cb(null, fileName)
    }
});

const fileFilter = (req, file, cb)=> {
    
    
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else{
        cb(new Error('Invalid image format, only images allowed'))
    }
}

const limits = {
    fileSize: 1024 * 1024 * 5
}

const upload =multer({
    storage,
    fileFilter,
    limits
})

module.exports = upload;
