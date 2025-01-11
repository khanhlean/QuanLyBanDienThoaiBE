const Database = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const upload = require('../middleware/multer');
const jwt = require('jsonwebtoken');

// const pool = Database.getInstance();
// pool.connect();

let getAllDienThoai = async (req, res) => {
    try {
        const query = 'SELECT * FROM DIENTHOAI';
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

let themDienThoai = async (req, res) => {
    const { TenDT, Gia, SoLuong, MoTa, MaLoai, MaHang } = req.body;

    try {
        // Lấy MaGV lớn nhất hiện tại từ bảng GiangVien để xác định số tiếp theo
        const getMaxMaGVQuery = 'SELECT MAX(CAST(SUBSTRING(MaDT, 3, LEN(MaDT)) AS INT)) AS MaxMaGV FROM DIENTHOAI';
        const maxMaGVResult = await pool.executeQuery(getMaxMaGVQuery);
        const maxMaGV = maxMaGVResult.length > 0 ? maxMaGVResult[0].MaxMaGV : 0;
        console.log(TenDT, Gia, SoLuong, MoTa, MaLoai, MaHang);
        // Tạo mã giảng viên mới
        let nextMaGV = 'DT1';
        if (maxMaGV) {
            const currentNumber = parseInt(maxMaGV);
            const nextNumber = currentNumber + 1;
            nextMaGV = 'DT' + nextNumber.toString().padStart(1, '0');
        }

        const createHoaDonQuery = `INSERT INTO DIENTHOAI (MaDT, TenDT, Gia, SoLuong, MoTa, HinhAnh, MaLoai,MaHang)
        VALUES ('${nextMaGV}', '${TenDT}', ${Gia}, '${SoLuong}','${MoTa}', 'phone.png','${MaLoai}','${MaHang}')`;

        await pool.executeQuery(createHoaDonQuery);

        res.status(200).json({ success: true, message: 'Thêm giảng viên thành công', MaGV: nextMaGV });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// let themDienThoai = async (req, res) => {
//     upload(req, res, async function (err) {
//         if (err) {
//             return res.status(500).json({ success: false, message: 'Lỗi up file' });
//         }
//         console.log(req.file);
//         const { TenDT, Gia, SoLuong, MoTa, MaLoai, MaHang } = req.body;

//         try {
//             const getMaxMaDTQuery = 'SELECT MAX(CAST(SUBSTRING(MaDT, 3, LEN(MaDT)) AS INT)) AS MaxMaDT FROM DIENTHOAI';
//             const maxMaDTResult = await pool.executeQuery(getMaxMaDTQuery);
//             const maxMaDT = maxMaDTResult.length > 0 ? maxMaDTResult[0].MaxMaDT : 0;

//             let nextMaDT = 'DT1';
//             if (maxMaDT) {
//                 const currentNumber = parseInt(maxMaDT);
//                 const nextNumber = currentNumber + 1;
//                 nextMaDT = 'DT' + nextNumber.toString().padStart(1, '0');
//             }

//             const createDienThoaiQuery = `
//             INSERT INTO DIENTHOAI (MaDT, TenDT, Gia, SoLuong, MoTa, HinhAnh, MaLoai, MaHang)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//             // Sử dụng tham số để tránh SQL Injection
//             await pool.executeQuery(createDienThoaiQuery, [
//                 nextMaDT,
//                 TenDT,
//                 Gia,
//                 SoLuong,
//                 MoTa,
//                 req.file.filename,
//                 MaLoai,
//                 MaHang,
//             ]);

//             res.status(200).json({ success: true, message: 'Thêm điện thoại thành công', MaDT: nextMaDT });
//         } catch (error) {
//             console.log('Error:', error);
//             res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
//         }
//     });
// };

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
    getAllDienThoai,
    get3DienThoaiBatKi,
    getDienThoaiTheoMaDT,
    themDienThoai,
    xoaDienThoai,
};
