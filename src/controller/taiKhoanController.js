const Database = require('../config/database');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = Database.getInstance();
pool.connect();

const dangNhap = async (req, res) => {
    const { SDT, Password } = req.body;

    if (!SDT || !Password) {
        res.status(400).json({ error: 'Số điện thoại hoặc mật khẩu không được để trống' });
        return;
    }

    try {
        const query = `SELECT * FROM dbo.KHACHHANG WHERE SDT = '${SDT}'`;
        const result = await pool.executeQuery(query);

        if (result.length > 0) {
            const { MaKH, Password: storedPassword, MaQuyen } = result[0];

            if (Password === storedPassword) {
                // Tạo token JWT với MaKH
                const token = jwt.sign({ MaKH, MaQuyen }, 'jwt_secret_key');

                res.status(200).json({
                    MaKH,
                    SDT,
                    MaQuyen,
                    token,
                });
            } else {
                res.status(401).json({ error: 'Mật khẩu không trùng khớp với hệ thống' });
            }
        } else {
            res.status(401).json({ error: 'Số điện thoại này chưa được đăng ký' });
        }
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const dangNhapNV = async (req, res) => {
    const { SDT, Password } = req.body;

    if (!SDT || !Password) {
        res.status(400).json({ error: 'Số điện thoại hoặc mật khẩu không được để trống' });
        return;
    }

    try {
        const query = `SELECT * FROM dbo.NHANVIEN WHERE SDT = '${SDT}'`;
        const result = await pool.executeQuery(query);

        if (result.length > 0) {
            const { MaNV, Password: storedPassword, MaQuyen } = result[0];

            if (Password === storedPassword) {
                // Tạo token JWT với MaKH
                const token = jwt.sign({ MaNV, MaQuyen }, 'jwt_secret_key');

                res.status(200).json({
                    MaNV,
                    SDT,
                    MaQuyen,
                    token,
                });
            } else {
                res.status(401).json({ error: 'Mật khẩu không trùng khớp với hệ thống' });
            }
        } else {
            res.status(401).json({ error: 'Số điện thoại này chưa được đăng ký' });
        }
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let dangKy = async (req, res) => {
    //const { HoTen, HocVi, HocHam, Phai, NgaySinh, DiaChi } = req.body;
    const { Ho, Ten, DiaChi, SDT, Email, Password } = req.body;
    try {
        // Lấy MaGV lớn nhất hiện tại từ bảng GiangVien để xác định số tiếp theo
        const getMaxMaGVQuery = 'SELECT MAX(CAST(SUBSTRING(MaKH, 3, LEN(MaKH)) AS INT)) AS MaxMaGV FROM dbo.KHACHHANG';
        const maxMaGVResult = await pool.executeQuery(getMaxMaGVQuery);
        const maxMaGV = maxMaGVResult.length > 0 ? maxMaGVResult[0].MaxMaGV : 0; // Lấy giá trị số lớn nhất

        // Tạo mã giảng viên mới
        let nextMaGV = 'KH1'; // Mã giảng viên khởi tạo ban đầu
        if (maxMaGV) {
            const currentNumber = parseInt(maxMaGV); // Lấy số từ MaGV hiện tại
            const nextNumber = currentNumber + 1;
            nextMaGV = 'KH' + nextNumber.toString().padStart(1, '0'); // Tạo mã giảng viên tăng dần
        }
        // Thêm giảng viên vào bảng GiangVien
        const insertQuery = `INSERT INTO dbo.KHACHHANG (MaKH, Ho, Ten, DiaChi, SDT, Email, Password, MaQuyen) 
    VALUES ('${nextMaGV}', '${Ho}', '${Ten}', '${DiaChi}', '${SDT}', '${Email}', '${Password}' , 'KH')`;

        await pool.executeQuery(insertQuery);

        res.status(200).json({ success: true, message: 'Đăng kí thành công', MaGV: nextMaGV });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let checkMatKhauTrung = async (req, res) => {
    const { MaKH, Password } = req.body;

    if (!MaKH || !Password) {
        res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
        return;
    }

    try {
        const query = `SELECT Password FROM dbo.KHACHHANG WHERE MaKH = '${MaKH}'`;
        const result = await pool.executeQuery(query);

        if (result.length === 0) {
            res.status(404).json({ error: 'Không tìm thấy thông tin khách hàng' });
            return;
        }

        const storedPassword = result[0].Password;
        console.log(Password);
        console.log(storedPassword);
        if (Password === storedPassword) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ error: 'Mật khẩu không trùng khớp' });
        }
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let doiMatKhau = async (req, res) => {
    const { MaKH, NewPassword } = req.body;

    if (!MaKH || !NewPassword) {
        res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
        return;
    }

    try {
        // Update mật khẩu mới vào database
        const updateQuery = `UPDATE dbo.KHACHHANG SET Password = '${NewPassword}' WHERE MaKH = '${MaKH}'`;
        await pool.executeQuery(updateQuery);

        res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    dangNhap,
    dangNhapNV,
    doiMatKhau,
    dangKy,
    checkMatKhauTrung,
};
