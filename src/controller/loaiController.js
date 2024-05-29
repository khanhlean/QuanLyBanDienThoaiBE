const Database = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const pool = Database.getInstance();
pool.connect();

let getAllLoai = async (req, res) => {
    try {
        const query = 'SELECT * FROM LOAI';
        const result = await pool.executeQuery(query);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let getAllNhanVien = async (req, res) => {
    try {
        const query = 'SELECT TEN FROM NHANVIEN';
        const result = await pool.executeQuery(query);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let themLoai = async (req, res) => {
    const { TenLoai, MoTa } = req.body;
    console.log(TenLoai, MoTa);
    try {
        // Lấy MaGV lớn nhất hiện tại từ bảng GiangVien để xác định số tiếp theo
        const getMaxMaGVQuery = 'SELECT MAX(CAST(SUBSTRING(MaLoai, 2, LEN(MaLoai)) AS INT)) AS MaxMaGV FROM LOAI';
        const maxMaGVResult = await pool.executeQuery(getMaxMaGVQuery);
        const maxMaGV = maxMaGVResult.length > 0 ? maxMaGVResult[0].MaxMaGV : 0;

        // Tạo mã giảng viên mới
        let nextMaGV = 'L1';
        if (maxMaGV) {
            const currentNumber = parseInt(maxMaGV);
            const nextNumber = currentNumber + 1;
            nextMaGV = 'L' + nextNumber.toString().padStart(1, '0');
        }

        const createHoaDonQuery = `INSERT INTO LOAI (MaLoai, TenLoai, MoTa)
        VALUES ('${nextMaGV}', N'${TenLoai}',N'${MoTa}')`;

        await pool.executeQuery(createHoaDonQuery);

        res.status(200).json({ success: true, message: 'Thêm giảng viên thành công', MaGV: nextMaGV });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let suaLoai = async (req, res) => {
    const { MaLoai } = req.params;
    const { TenLoai, MoTa } = req.body;

    //1 chờ xác nhận
    //2 đang chuẩn bị hàng
    //3 đang giao

    try {
        const query = `UPDATE LOAI SET TenLoai = N'${TenLoai}',MoTa = N'${MoTa}' WHERE MaLoai = '${MaLoai}'`;
        const result = await pool.executeQuery(query);
        res.status(200).json({ success: true });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let xoaLoai = async (req, res) => {
    const { MaLoai } = req.params;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM LOAI WHERE MaLoai = '${MaLoai}'`;
        const checkGiangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (checkGiangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy dt' });
        }

        const deleteGiangVienQuery = `DELETE FROM LOAI WHERE MaLoai = '${MaLoai}'`;
        await pool.executeQuery(deleteGiangVienQuery);

        res.status(200).json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllLoai,
    themLoai,
    suaLoai,
    xoaLoai,
    getAllNhanVien,
};
