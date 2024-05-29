const Database = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const pool = Database.getInstance();
pool.connect();

let capNhatThongTinNguoiDung = async (req, res) => {
    const { MaKH, Ho, Ten, DiaChi, SDT, Email } = req.body;

    if (!MaKH) {
        res.status(400).json({ success: false, message: 'không có mã KH' });
        return;
    }

    try {
        // Kiểm tra xem người dùng có tồn tại không
        const checkQuery = `SELECT * FROM dbo.KHACHHANG WHERE MaKH = '${MaKH}'`;
        const checkResult = await pool.executeQuery(checkQuery);

        if (checkResult.length === 0) {
            res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người dùng' });
            return;
        }

        // Update thông tin người dùng vào database
        const updateQuery = `UPDATE dbo.KHACHHANG SET Ho = '${Ho}', Ten = '${Ten}', DiaChi = '${DiaChi}', SDT = '${SDT}', Email = '${Email}' WHERE MaKH = '${MaKH}'`;
        await pool.executeQuery(updateQuery);

        res.status(200).json({ success: true, message: 'Cập nhật thông tin người dùng thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

let getAllKhachHang = async (req, res) => {
    try {
        const query = 'SELECT * FROM KHACHHANG';
        const result = await pool.executeQuery(query);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

module.exports = {
    capNhatThongTinNguoiDung,
    getAllKhachHang,
};
