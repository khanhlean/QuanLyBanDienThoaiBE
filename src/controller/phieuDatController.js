const Database = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const pool = Database.getInstance();
pool.connect();

let getAllPhieuDat = async (req, res) => {
    try {
        const query =
            'SELECT PD.MaPD, PD.Ho, PD.Ten, PD.DiaChi, PD.SDT, PD.NgayDat, PD.TrangThai, CT.DonGia, PD.MaNVDuyet  FROM PHIEUDAT PD JOIN CTDAT CT ON PD.MaPD=CT.MaPD';
        const result = await pool.executeQuery(query);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let getPhieuDatbyMaKH = async (req, res) => {
    const { MaKH } = req.params;

    if (!MaKH) {
        res.status(400).json({ error: 'Vui lòng cung cấp Mã KH' });
        return;
    }

    try {
        const query = `SELECT CT.MaPD, CT.MaDT, CT.SoLuong, CT.DonGia,
        PD.NgayDat, PD.Ho, PD.Ten, PD.DiaChi, PD.SDT,  PD.TrangThai, PD.MaNVDuyet,
        DT.Gia, DT.TenDT, DT.HinhAnh
        FROM CTDAT CT 
        JOIN PHIEUDAT PD ON CT.MaPD = PD.MaPD
        jOIN DIENTHOAI DT ON CT.MaDT = DT.MaDT
        WHERE PD.MaKH = '${MaKH}'`;
        const result = await pool.executeQuery(query);

        if (result.length === 0) {
            res.status(404).json({ error: 'Không tìm thấy thông tin KH' });
            return;
        }

        res.status(200).json(result);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let updateTrangThai = async (req, res) => {
    const { MaPD } = req.params;
    const { check, MaNV } = req.body;

    if (!MaPD) {
        res.status(400).json({ error: 'Vui lòng cung cấp Mã KH' });
        return;
    }

    //1 chờ xác nhận
    //2 đang chuẩn bị hàng
    //3 đang giao

    try {
        if (check === 1) {
            const query = `UPDATE PHIEUDAT SET TrangThai = N'Đang chuẩn bị hàng' WHERE MaPD = '${MaPD}'`;
            const query2 = `UPDATE PHIEUDAT SET MaNVDuyet = '${MaNV}' WHERE MaPD = '${MaPD}'`;
            const result = await pool.executeQuery(query);
            const result2 = await pool.executeQuery(query2);
            res.status(200).json({ success: true });
        }
        if (check === 2) {
            const query = `UPDATE PHIEUDAT SET TrangThai = N'Đang giao' WHERE MaPD = '${MaPD}'`;
            const result = await pool.executeQuery(query);
            res.status(200).json({ success: true });
        }
        if (check === 3) {
            const query = `UPDATE PHIEUDAT SET TrangThai = N'Hoàn tất' WHERE MaPD = '${MaPD}'`;
            const result = await pool.executeQuery(query);
            res.status(200).json({ success: true });
        }

        // if (result.length === 0) {
        //     res.status(404).json({ error: 'Không tìm thấy thông tin KH' });
        //     return;
        // }
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let themPhieuDat = async (req, res) => {
    const { MaKH, MaDT, DonGia, SoLuong } = req.body;

    try {
        // Lấy MaGV lớn nhất hiện tại từ bảng GiangVien để xác định số tiếp theo
        const getMaxMaGVQuery = 'SELECT MAX(CAST(SUBSTRING(MaPD, 3, LEN(MaPD)) AS INT)) AS MaxMaGV FROM PHIEUDAT';
        const maxMaGVResult = await pool.executeQuery(getMaxMaGVQuery);
        const maxMaGV = maxMaGVResult.length > 0 ? maxMaGVResult[0].MaxMaGV : 0;

        // Tạo mã giảng viên mới
        let nextMaGV = 'PD1';
        if (maxMaGV) {
            const currentNumber = parseInt(maxMaGV);
            const nextNumber = currentNumber + 1;
            nextMaGV = 'PD' + nextNumber.toString().padStart(1, '0');
        }

        const customerQuery = `SELECT Ho, Ten, DiaChi, SDT FROM KHACHHANG WHERE MaKH =  '${MaKH}'`;
        const customerRows = await pool.executeQuery(customerQuery);

        if (customerRows.length === 0) {
            return res.status(404).json({ message: 'Khach hang khong ton tai' });
        }

        const { Ho, Ten, DiaChi, SDT } = customerRows[0];

        const createPhieuDatQuery = `INSERT INTO PHIEUDAT (MaPD, NgayDat, Ho, Ten, DiaChi, SDT, TrangThai, MaKH, MaNVDuyet)
        VALUES ('${nextMaGV}', GETDATE(), N'${Ho}', N'${Ten}', N'${DiaChi}', N'${SDT}', N'Chờ xác nhận', N'${MaKH}', NULL)`;

        await pool.executeQuery(createPhieuDatQuery);
        console.log(MaDT, DonGia, SoLuong);
        const createCTDatQuery = `INSERT INTO CTDAT (MaPD, MaDT, SoLuong, DonGia)
        VALUES ('${nextMaGV}', N'${MaDT}', ${SoLuong}, ${DonGia})`;

        await pool.executeQuery(createCTDatQuery);

        res.status(200).json({ success: true, message: 'Thêm giảng viên thành công', MaGV: nextMaGV });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let xoaPhieuDat = async (req, res) => {
    const { MaPD } = req.params;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM CTDAT WHERE MaPD = '${MaPD}'`;
        const checkGiangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (checkGiangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy phieu dat' });
        }

        // Xóa giảng viên
        const deleteGiangVienQuery = `DELETE FROM CTDAT WHERE MaPD = '${MaPD}'`;
        await pool.executeQuery(deleteGiangVienQuery);

        // Xóa tài khoản của giảng viên
        const deleteTaiKhoanQuery = `DELETE FROM PHIEUDAT WHERE MaPD = '${MaPD}'`;
        await pool.executeQuery(deleteTaiKhoanQuery);

        res.status(200).json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllPhieuDat,
    xoaPhieuDat,
    themPhieuDat,
    getPhieuDatbyMaKH,
    updateTrangThai,
};
