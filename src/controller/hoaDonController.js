const pool = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

// const pool = Database.getInstance();
// pool.connect();

let getAllHoaDon = async (req, res) => {
    try {
        const query = 'SELECT * FROM HOADON';
        const result = await pool.executeQuery(query);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let themHoaDon = async (req, res) => {
    const { MaPD, TongTien } = req.body;

    try {
        // Lấy MaGV lớn nhất hiện tại từ bảng GiangVien để xác định số tiếp theo
        const getMaxMaGVQuery = 'SELECT MAX(CAST(SUBSTRING(MaHD, 3, LEN(MaHD)) AS INT)) AS MaxMaGV FROM HOADON';
        const maxMaGVResult = await pool.executeQuery(getMaxMaGVQuery);
        const maxMaGV = maxMaGVResult.length > 0 ? maxMaGVResult[0].MaxMaGV : 0;

        // Tạo mã giảng viên mới
        let nextMaGV = 'HD1';
        if (maxMaGV) {
            const currentNumber = parseInt(maxMaGV);
            const nextNumber = currentNumber + 1;
            nextMaGV = 'HD' + nextNumber.toString().padStart(1, '0');
        }

        const createHoaDonQuery = `INSERT INTO HOADON (MaHD, NgayTaoHD, TongTien, MaPD)
        VALUES ('${nextMaGV}', GETDATE(), ${TongTien}, '${MaPD}')`;

        await pool.executeQuery(createHoaDonQuery);

        res.status(200).json({ success: true, message: 'Thêm giảng viên thành công', MaGV: nextMaGV });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let xoaHoaDon = async (req, res) => {
    const { MaHD } = req.params;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM HOADON WHERE MaHD = '${MaHD}'`;
        const checkGiangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (checkGiangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy hd' });
        }

        const deleteGiangVienQuery = `DELETE FROM HOADON WHERE MaHD = '${MaHD}'`;
        await pool.executeQuery(deleteGiangVienQuery);

        res.status(200).json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllHoaDon,
    themHoaDon,
    xoaHoaDon,
};
