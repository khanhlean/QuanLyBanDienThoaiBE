const multer = require('multer');
const fs = require('fs');

const imgDir = 'public/img';

if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
}

// Tạo một storage engine để lưu trữ file hình
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imgDir); // Thay đổi đường dẫn tới thư mục lưu trữ file hình của bạn
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
        // Tạo tên file mới
    },
});

// Tạo một instance của Multer middleware với storage engine đã tạo
const upload = multer({ storage: storage }).single('image');

module.exports = upload;
