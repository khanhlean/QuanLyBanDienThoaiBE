const Database = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const pool = Database.getInstance();
pool.connect();

let getAllHang = async (req, res) => {
    try {
        const query = 'SELECT * FROM HANG';
        const result = await pool.executeQuery(query);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let get3DienThoaiBatKi = async (req, res) => {
    try {
        const query = `
        SELECT TOP 5 *
        FROM DIENTHOAI
        ORDER BY NEWID();
      `;
        const result = await pool.executeQuery(query);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let getDienThoaiTheoMaDT = async (req, res) => {
    const { MaDT } = req.params;

    if (!MaDT) {
        res.status(400).json({ success: false, error: 'Vui lòng cung cấp Mã điện thoại' });
        return;
    }

    try {
        const query = `SELECT * FROM DIENTHOAI WHERE MaDT = '${MaDT}'`;
        const result = await pool.executeQuery(query);

        if (result.length === 0) {
            res.status(404).json({ success: false, error: 'Không tìm thấy thông tin điện thoại' });
            return;
        }

        res.status(200).json({ success: true, data: result[0] });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

let xoaDienThoai = async (req, res) => {
    const { MaDT } = req.params;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM DIENTHOAI WHERE MaDT = '${MaDT}'`;
        const checkGiangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (checkGiangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy dt' });
        }

        const deleteGiangVienQuery = `DELETE FROM DIENTHOAI WHERE MaDT = '${MaDT}'`;
        await pool.executeQuery(deleteGiangVienQuery);

        res.status(200).json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllHang,
    get3DienThoaiBatKi,
    getDienThoaiTheoMaDT,
    xoaDienThoai,
};
