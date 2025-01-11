const pool = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

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

let getDTKhuyenMai = async (req, res) => {
    try {
        const query = `
        SELECT CT.MaDT, CT.PhanTramGiam,
	    DT.TenDT, DT.HinhAnh
        FROM dbo.CTKHUYENMAI CT
        JOIN dbo.DOTKHUYENMAI DOT ON CT.MaDotKM = DOT.MaDotKM
        JOIN dbo.DIENTHOAI DT ON CT.MaDT = DT.MaDT
        WHERE GETDATE() BETWEEN DOT.NgayBD AND DOT.NgayKT;
      `;
        const result = await pool.executeQuery(query);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let checkDTCoKM = async (req, res) => {
    const { MaDT } = req.params;
    try {
        const query = `
        SELECT CT.MaDT, CT.PhanTramGiam,
	    DT.TenDT, DT.HinhAnh
        FROM dbo.CTKHUYENMAI CT
        JOIN dbo.DOTKHUYENMAI DOT ON CT.MaDotKM = DOT.MaDotKM
        JOIN dbo.DIENTHOAI DT ON CT.MaDT = DT.MaDT
        WHERE GETDATE() BETWEEN DOT.NgayBD AND DOT.NgayKT AND CT.MaDT = '${MaDT}';
      `;
        const result = await pool.executeQuery(query);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// let getDTKhuyenMai = async (req, res) => {
//     try {
//         const query =
//             'SELECT CT.MaDT, CT.PhanTramGiam FROM dbo.CTKHUYENMAI CT JOIN dbo.DOTKHUYENMAI DOT ON CT.MaDotKM = DOT.MaDotKM WHERE GETDATE() BETWEEN DOT.NgayBD AND DOT.NgayKT;';
//         const result = await pool.executeQuery(query);

//         if (result.length === 0) {
//             res.status(404).json({ success: false, error: 'Không tìm thấy thông tin điện thoại' });
//             return;
//         }

//         res.status(200).json({ success: true, data: result[0] });
//     } catch (error) {
//         console.log('Error:', error);
//         res.status(500).json({ success: false, error: 'Internal server error' });
//     }
// };

module.exports = {
    getDTKhuyenMai,
    checkDTCoKM,
};
