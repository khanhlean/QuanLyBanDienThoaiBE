const Database = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const pool = Database.getInstance();
pool.connect();

let getAllGiangVien = async (req, res) => {
    try {
        const query = 'SELECT * FROM NHANVIEN';
        const result = await pool.executeQuery(query);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

let hienGiangVien = async (req, res) => {
    const { MaGV } = req.params;

    try {
        const query = `SELECT * FROM dbo.GiangVien WHERE MaGV = '${MaGV}'`;
        const result = await pool.executeQuery(query);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        const giangVien = result[0];

        res.status(200).json({ success: true, giangVien });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let themGiangVien = async (req, res) => {
    const { HoTen, HocVi, HocHam, Phai, NgaySinh, DiaChi } = req.body;

    try {
        // Lấy MaGV lớn nhất hiện tại từ bảng GiangVien để xác định số tiếp theo
        const getMaxMaGVQuery = 'SELECT MAX(CAST(SUBSTRING(MaGV, 3, LEN(MaGV)) AS INT)) AS MaxMaGV FROM dbo.GiangVien';
        const maxMaGVResult = await pool.executeQuery(getMaxMaGVQuery);
        const maxMaGV = maxMaGVResult.length > 0 ? maxMaGVResult[0].MaxMaGV : 0; // Lấy giá trị số lớn nhất

        // Tạo mã giảng viên mới
        let nextMaGV = 'GV1'; // Mã giảng viên khởi tạo ban đầu
        if (maxMaGV) {
            const currentNumber = parseInt(maxMaGV); // Lấy số từ MaGV hiện tại
            const nextNumber = currentNumber + 1;
            nextMaGV = 'GV' + nextNumber.toString().padStart(1, '0'); // Tạo mã giảng viên tăng dần
        }
        // Thêm giảng viên vào bảng GiangVien
        const insertGiangVienQuery = `INSERT INTO dbo.GiangVien (MaGV, HoTen, HocVi, HocHam, Phai, NgaySinh, DiaChi)
    VALUES ('${nextMaGV}', N'${HoTen}', N'${HocVi}', N'${HocHam}', ${Phai}, '${NgaySinh}', N'${DiaChi}')`;

        await pool.executeQuery(insertGiangVienQuery);

        // Tạo tài khoản cho giảng viên với mật khẩu đã được băm (bcrypt)
        const hashedPassword = await bcrypt.hash('123456789', 10); // Băm mật khẩu '12345678' với bcrypt

        const insertTaiKhoanQuery = `INSERT INTO dbo.TaiKhoan (MaTk, TenTaiKhoan, MatKhau, MaVaitro)
    VALUES ('${nextMaGV}', '${nextMaGV}', '${hashedPassword}', 'GV')`;

        await pool.executeQuery(insertTaiKhoanQuery);

        res.status(200).json({ success: true, message: 'Thêm giảng viên thành công', MaGV: nextMaGV });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let suaGiangVien = async (req, res) => {
    const { HoTen, HocVi, HocHam, Phai, NgaySinh, DiaChi } = req.body;
    const { Magv } = req.params;
    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM dbo.GiangVien WHERE MaGV = '${Magv}'`;
        const checkGiangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (checkGiangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Cập nhật thông tin giảng viên
        const updateGiangVienQuery = `UPDATE dbo.GiangVien SET HoTen = N'${HoTen}', HocVi = N'${HocVi}', HocHam = N'${HocHam}', Phai = ${Phai}, NgaySinh = '${NgaySinh}', DiaChi = N'${DiaChi}' WHERE MaGV = '${Magv}'`;

        await pool.executeQuery(updateGiangVienQuery);

        res.status(200).json({ success: true, message: 'Cập nhật giảng viên thành công', MaGV: Magv });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let xoaGiangVien = async (req, res) => {
    const { Magv } = req.params;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM dbo.GiangVien WHERE MaGV = '${Magv}'`;
        const checkGiangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (checkGiangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Xóa giảng viên
        const deleteGiangVienQuery = `DELETE FROM dbo.GiangVien WHERE MaGV = '${Magv}'`;
        await pool.executeQuery(deleteGiangVienQuery);

        // Xóa tài khoản của giảng viên
        const deleteTaiKhoanQuery = `DELETE FROM dbo.TaiKhoan WHERE MaTk = '${Magv}'`;
        await pool.executeQuery(deleteTaiKhoanQuery);

        res.status(200).json({ success: true, message: 'Xóa giảng viên và tài khoản thành công', MaGV: Magv });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let choGiangVienNghi = async (req, res) => {
    const { MaGV } = req.params;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM dbo.GiangVien WHERE MaGV = '${MaGV}'`;
        const checkGiangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (checkGiangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Kiểm tra xem giảng viên đang dạy một lớp tín chỉ còn hoạt động hay không
        const checkDangDayQuery = `
      SELECT *
      FROM dbo.PhanCong pc
      INNER JOIN dbo.LopTinChi ltc ON pc.MaLTC = ltc.MaLTC
      WHERE pc.MaGV = '${MaGV}' AND ltc.Active = 1
    `;
        const checkDangDayResult = await pool.executeQuery(checkDangDayQuery);

        if (checkDangDayResult.length > 0) {
            return res.status(400).json({ error: 'Giảng viên đang dạy một lớp tín chỉ còn hoạt động' });
        }

        // Cập nhật trạng thái nghỉ cho giảng viên
        const updateGiangVienQuery = `UPDATE dbo.GiangVien SET Active = 0 WHERE MaGV = '${MaGV}'`;
        await pool.executeQuery(updateGiangVienQuery);

        // Cập nhật trạng thái Active = false trong bảng TaiKhoan
        const updateTaiKhoanQuery = `UPDATE dbo.TaiKhoan SET Active = 0 WHERE MaTk = '${MaGV}'`;
        await pool.executeQuery(updateTaiKhoanQuery);

        res.status(200).json({ success: true, message: 'Cho giảng viên nghỉ thành công', MaGV });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let hienThiBangThoiGianBieu = async (req, res) => {
    try {
        // Câu truy vấn SQL để lấy thông tin tất cả các buổi trong bảng ThoiGianBieu
        const query = `SELECT * FROM ThoiGianBieu`;

        // Thực hiện truy vấn
        const result = await pool.executeQuery(query);

        // Trả về kết quả
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let dieuChinhBuoiCoTheDay = async (req, res) => {
    const { MaGV, MaTGBs } = req.body;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Lấy danh sách các buổi giảng viên có thể dạy hiện tại
        const getBuoiCoTheDayQuery = `SELECT MaTGB FROM BuoiCoTheDay WHERE MaGV = '${MaGV}'`;
        const buoiCoTheDayResult = await pool.executeQuery(getBuoiCoTheDayQuery);
        const existingBuoiCoTheDay = buoiCoTheDayResult.map((buoi) => buoi.MaTGB);

        // Tìm các buổi cần thêm và xóa
        const buoiThem = MaTGBs.filter((maTGB) => !existingBuoiCoTheDay.includes(maTGB));
        const buoiXoa = existingBuoiCoTheDay.filter((maTGB) => !MaTGBs.includes(maTGB));

        // Thêm các buổi mới vào bảng BuoiCoTheDay
        if (buoiThem.length > 0) {
            const insertBuoiCoTheDayQuery = `INSERT INTO BuoiCoTheDay (MaGV, MaTGB) VALUES `;
            const values = buoiThem.map((maTGB) => `('${MaGV}', ${maTGB})`).join(', ');
            await pool.executeQuery(insertBuoiCoTheDayQuery + values);
        }

        // Xóa các buổi không còn trong danh sách MaTGBs
        if (buoiXoa.length > 0) {
            const deleteBuoiCoTheDayQuery = `DELETE FROM BuoiCoTheDay WHERE MaGV = '${MaGV}' AND MaTGB IN (${buoiXoa.join(
                ', ',
            )})`;
            await pool.executeQuery(deleteBuoiCoTheDayQuery);
        }

        res.status(200).json({ success: true, message: 'Điều chỉnh buổi có thể dạy thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let hienThiBuoiChuaTheDay = async (req, res) => {
    const { MaGV } = req.params;
    console.log(MaGV);

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Lấy danh sách các buổi giảng viên đã có thể dạy
        const getBuoiCoTheDayQuery = `SELECT MaTGB FROM BuoiCoTheDay WHERE MaGV = '${MaGV}'`;
        const buoiCoTheDayResult = await pool.executeQuery(getBuoiCoTheDayQuery);
        const buoiCoTheDayList = buoiCoTheDayResult.map((buoi) => buoi.MaTGB);

        let buoiChuaTheDayResult = [];
        if (buoiCoTheDayList.length > 0) {
            // Lấy danh sách các buổi chưa thể dạy
            const getBuoiChuaTheDayQuery = `SELECT MaTGB, Thu, Buoi FROM ThoiGianBieu WHERE MaTGB NOT IN (${buoiCoTheDayList.join(
                ',',
            )})`;
            buoiChuaTheDayResult = await pool.executeQuery(getBuoiChuaTheDayQuery);
        } else {
            // Lấy toàn bộ danh sách các buổi
            const getAllBuoiQuery = `SELECT MaTGB, Thu, Buoi FROM ThoiGianBieu`;
            buoiChuaTheDayResult = await pool.executeQuery(getAllBuoiQuery);
        }

        res.status(200).json({
            success: true,
            buoiChuaTheDay: buoiChuaTheDayResult.map((buoi) => ({
                MaTGB: buoi.MaTGB,
                Thu: buoi.Thu,
                Buoi: buoi.Buoi,
            })),
        });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let hienThiBuoiCoTheDay = async (req, res) => {
    const { MaGV } = req.params;
    console.log(MaGV);

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Lấy danh sách các buổi giảng viên có thể dạy
        const getBuoiCoTheDayQuery = `SELECT BuoiCoTheDay.MaTGB, ThoiGianBieu.Thu, ThoiGianBieu.Buoi
      FROM BuoiCoTheDay
      INNER JOIN ThoiGianBieu ON BuoiCoTheDay.MaTGB = ThoiGianBieu.MaTGB
      WHERE BuoiCoTheDay.MaGV = '${MaGV}'`;
        const buoiCoTheDayResult = await pool.executeQuery(getBuoiCoTheDayQuery);
        const buoiCoTheDayList = buoiCoTheDayResult.map((buoi) => ({
            MaTGB: buoi.MaTGB,
            Thu: buoi.Thu,
            Buoi: buoi.Buoi,
        }));

        res.status(200).json({ success: true, buoiCoTheDay: buoiCoTheDayList });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let themBuoiCoTheDay = async (req, res) => {
    const { MaGV, MaTGB } = req.body;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Kiểm tra xem buổi đã tồn tại trong bảng BuoiCoTheDay chưa
        const checkBuoiCoTheDayQuery = `SELECT * FROM BuoiCoTheDay WHERE MaGV = '${MaGV}' AND MaTGB = '${MaTGB}'`;
        const buoiCoTheDayResult = await pool.executeQuery(checkBuoiCoTheDayQuery);

        if (buoiCoTheDayResult.length > 0) {
            return res.status(400).json({ error: 'Buổi đã tồn tại trong danh sách có thể dạy' });
        }

        // Thêm buổi mới vào bảng BuoiCoTheDay
        const insertBuoiCoTheDayQuery = `INSERT INTO BuoiCoTheDay (MaGV, MaTGB) VALUES ('${MaGV}', '${MaTGB}')`;
        await pool.executeQuery(insertBuoiCoTheDayQuery);

        res.status(200).json({ success: true, message: 'Thêm buổi có thể dạy thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let xoaBuoiCoTheDay = async (req, res) => {
    const { MaGV, MaTGB } = req.body;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Kiểm tra xem buổi có tồn tại trong bảng BuoiCoTheDay hay không
        const checkBuoiCoTheDayQuery = `SELECT * FROM BuoiCoTheDay WHERE MaGV = '${MaGV}' AND MaTGB = '${MaTGB}'`;
        const buoiCoTheDayResult = await pool.executeQuery(checkBuoiCoTheDayQuery);

        if (buoiCoTheDayResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy buổi có thể dạy' });
        }

        // Xóa buổi khỏi bảng BuoiCoTheDay
        const deleteBuoiCoTheDayQuery = `DELETE FROM BuoiCoTheDay WHERE MaGV = '${MaGV}' AND MaTGB = '${MaTGB}'`;
        await pool.executeQuery(deleteBuoiCoTheDayQuery);

        res.status(200).json({ success: true, message: 'Xóa buổi có thể dạy thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let hienThiBangChuaPhanCongTheoGiangVien = async (req, res) => {
    const { MaGV } = req.params;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Truy vấn SQL để lấy thông tin phân công của giảng viên
        const query = `
      SELECT pc.MaLTC, gv.MaGV, gv.HoTen, ltc.MaMH, mh.TenMH
      FROM PhanCong pc
      INNER JOIN GiangVien gv ON pc.MaGV = gv.MaGV
      INNER JOIN LopTinChi ltc ON pc.MaLTC = ltc.MaLTC
      INNER JOIN MonHoc mh ON ltc.MaMH = mh.MaMH
      WHERE gv.MaGV = '${MaGV}'
    `;

        // Thực hiện truy vấn
        const result = await pool.executeQuery(query);

        // Lấy danh sách các lớp tín chỉ đã được phân công
        const danhSachDaPhanCong = result.map((row) => row.MaLTC);

        // Lấy danh sách các lớp tín chỉ chưa được phân công, có lịch học trùng với CuoiCoTheDay của giảng viên và có môn học giảng viên có thể dạy được
        const queryLopTinChiChuaPhanCong = `
      SELECT LTC.MaLTC, LTC.NamHoc, LTC.HocKi, LTC.SLToiDa, LTC.NgayBD, LTC.NgayKT, LTC.Active, LTC.MaMH
      FROM LopTinChi LTC
      WHERE LTC.Active = 1 
        AND LTC.MaMH IN (
          SELECT MH.MaMH
          FROM MonHoc MH
          INNER JOIN Day D ON D.MaMH = MH.MaMH
          INNER JOIN BuoiCoTheDay BCTD ON BCTD.MaGV = D.MaGV
          INNER JOIN LichHoc LH ON LH.MaTGB = BCTD.MaTGB AND LH.MaLTC = LTC.MaLTC
          WHERE D.MaGV = '${MaGV}'
        )
        AND LTC.MaLTC NOT IN (${danhSachDaPhanCong.map((maLTC) => `'${maLTC}'`).join(',')})
    `;

        const lopTinChiChuaPhanCongResult = await pool.executeQuery(queryLopTinChiChuaPhanCong);

        res.status(200).json({ success: true, data: lopTinChiChuaPhanCongResult });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let hienThiBangPhanCongTheoGiangVien = async (req, res) => {
    const { MaGV } = req.params;
    console.log(MaGV);
    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Truy vấn SQL để lấy thông tin phân công của giảng viên
        const query = `
      SELECT pc.MaLTC, gv.MaGV, gv.HoTen, ltc.MaMH, mh.TenMH
      FROM PhanCong pc
      INNER JOIN GiangVien gv ON pc.MaGV = gv.MaGV
      INNER JOIN LopTinChi ltc ON pc.MaLTC = ltc.MaLTC
      INNER JOIN MonHoc mh ON ltc.MaMH = mh.MaMH
      WHERE gv.MaGV = '${MaGV}'
    `;

        // Thực hiện truy vấn
        const result = await pool.executeQuery(query);

        // Trả về kết quả
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let phanCongGiangVien = async (req, res) => {
    const { MaGV, MaLTC } = req.body;

    try {
        // Kiểm tra xem giảng viên có khả năng dạy ltc đó hay không
        const checkDayQuery = `
      SELECT ltc.maltc
      FROM PhanCong pc
      INNER JOIN GiangVien gv ON pc.MaGV = gv.MaGV
      INNER JOIN LopTinChi ltc ON pc.MaLTC = ltc.MaLTC
      WHERE gv.MaGV = '${MaGV}';
    `;
        const dayResult = await pool.executeQuery(checkDayQuery);
        if (dayResult.length === 0) {
            return res.status(400).json({ error: 'Giảng viên không có khả năng dạy môn này' });
        }

        // Kiểm tra xem giảng viên có thời gian để dạy lớp tín chỉ đó hay không
        const checkLichHocQuery = `
      SELECT *
      FROM LichHoc lh
      WHERE lh.MaLTC = '${MaLTC}';
    `;
        const lichHocResult = await pool.executeQuery(checkLichHocQuery);
        if (lichHocResult.length === 0) {
            return res.status(400).json({ error: 'Lớp tín chỉ không có lịch học' });
        }

        // Kiểm tra xem giảng viên có buổi trống để dạy lớp tín chỉ đó hay không
        const checkBuoiDayQuery = `
      SELECT *
      FROM BuoiCoTheDay b
      WHERE b.MaGV = '${MaGV}' AND b.MaTGB IN (
        SELECT lh.MaTGB
        FROM LichHoc lh
        WHERE lh.MaLTC = '${MaLTC}'
      );
    `;
        const buoiDayResult = await pool.executeQuery(checkBuoiDayQuery);
        if (buoiDayResult.length === 0) {
            return res.status(400).json({ error: 'Giảng viên không có thời gian để dạy lớp tín chỉ này' });
        }

        // Tiến hành phân công giảng viên
        const insertPhanCongQuery = `
      INSERT INTO PhanCong (MaLTC, MaGV)
      VALUES ('${MaLTC}', '${MaGV}');
    `;
        await pool.executeQuery(insertPhanCongQuery);

        res.status(200).json({ success: true });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let xoaPhanCongGiangVien = async (req, res) => {
    const { MaGV, MaLTC } = req.body;

    try {
        // Kiểm tra xem phân công giảng viên tồn tại hay không
        const checkPhanCongQuery = `
      SELECT *
      FROM PhanCong
      WHERE MaGV = '${MaGV}' AND MaLTC = '${MaLTC}';
    `;
        const phanCongResult = await pool.executeQuery(checkPhanCongQuery);
        if (phanCongResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy phân công giảng viên' });
        }

        // Xóa phân công giảng viên
        const deletePhanCongQuery = `
      DELETE FROM PhanCong
      WHERE MaGV = '${MaGV}' AND MaLTC = '${MaLTC}';
    `;
        await pool.executeQuery(deletePhanCongQuery);

        res.status(200).json({ success: true });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let dieuChinhKhaNangDay = async (req, res) => {
    const { MaGV, MaMHs } = req.body;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Lấy danh sách các môn học giảng viên có thể dạy hiện tại
        const getKhaNangDayQuery = `SELECT MaMH FROM Day WHERE MaGV = '${MaGV}'`;
        const khaNangDayResult = await pool.executeQuery(getKhaNangDayQuery);
        const existingKhaNangDay = khaNangDayResult.map((khaNang) => khaNang.MaMH);

        // Tìm các môn cần thêm và xóa
        const monThem = MaMHs.filter((maMH) => !existingKhaNangDay.includes(maMH));
        const monXoa = existingKhaNangDay.filter((maMH) => !MaMHs.includes(maMH));

        // Thêm các môn mới vào bảng Day
        if (monThem.length > 0) {
            const insertKhaNangDayQuery = `INSERT INTO Day (MaGV, MaMH) VALUES `;
            const values = monThem.map((maMH) => `('${MaGV}', '${maMH}')`).join(', ');
            await pool.executeQuery(insertKhaNangDayQuery + values);
        }

        // Xóa các môn không còn trong danh sách MaMHs
        if (monXoa.length > 0) {
            const deleteKhaNangDayQuery = `DELETE FROM Day WHERE MaGV = '${MaGV}' AND MaMH IN ('${monXoa.join(
                "', '",
            )}')`;
            await pool.executeQuery(deleteKhaNangDayQuery);
        }

        res.status(200).json({ success: true, message: 'Điều chỉnh khả năng dạy thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let hienThiMonChuaTheDay = async (req, res) => {
    try {
        const { MaGV } = req.params;

        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Lấy danh sách các môn học giảng viên có thể dạy hiện tại
        const getKhaNangDayQuery = `
      SELECT Day.MaMH, MonHoc.TenMH
      FROM Day
      INNER JOIN MonHoc ON Day.MaMH = MonHoc.MaMH
      WHERE Day.MaGV = '${MaGV}'
    `;
        const khaNangDayResult = await pool.executeQuery(getKhaNangDayQuery);
        const khaNangDay = khaNangDayResult.map((khaNang) => khaNang.MaMH);

        // Lấy danh sách các môn chưa thể dạy
        const getMonChuaTheDayQuery = `SELECT MaMH, TenMH FROM MonHoc WHERE MaMH NOT IN ('${khaNangDay.join("','")}')`;
        const monChuaTheDayResult = await pool.executeQuery(getMonChuaTheDayQuery);

        res.status(200).json({ success: true, monChuaTheDay: monChuaTheDayResult });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let hienThiKhaNangDay = async (req, res) => {
    try {
        const { MaGV } = req.params;

        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Lấy danh sách các môn học giảng viên có thể dạy hiện tại
        const getKhaNangDayQuery = `
      SELECT Day.MaMH, MonHoc.TenMH
      FROM Day
      INNER JOIN MonHoc ON Day.MaMH = MonHoc.MaMH
      WHERE Day.MaGV = '${MaGV}'
    `;
        const khaNangDayResult = await pool.executeQuery(getKhaNangDayQuery);
        const khaNangDay = khaNangDayResult.map((khaNang) => ({
            MaMH: khaNang.MaMH,
            TenMH: khaNang.TenMH,
        }));

        res.status(200).json({ success: true, khaNangDay });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let themKhaNangDay = async (req, res) => {
    const { MaGV, MaMH } = req.body;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Kiểm tra xem môn học đã tồn tại hay chưa
        const checkMonHocQuery = `SELECT * FROM MonHoc WHERE MaMH = '${MaMH}'`;
        const monHocResult = await pool.executeQuery(checkMonHocQuery);

        if (monHocResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy môn học' });
        }

        // Kiểm tra xem khả năng dạy đã tồn tại hay chưa
        const checkKhaNangDayQuery = `SELECT * FROM Day WHERE MaGV = '${MaGV}' AND MaMH = '${MaMH}'`;
        const khaNangDayResult = await pool.executeQuery(checkKhaNangDayQuery);

        if (khaNangDayResult.length > 0) {
            return res.status(400).json({ error: 'Khả năng dạy đã tồn tại' });
        }

        // Thêm khả năng dạy mới vào bảng Day
        const insertKhaNangDayQuery = `INSERT INTO Day (MaGV, MaMH) VALUES ('${MaGV}', '${MaMH}')`;
        await pool.executeQuery(insertKhaNangDayQuery);

        res.status(200).json({ success: true, message: 'Thêm khả năng dạy thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

let xoaKhaNangDay = async (req, res) => {
    const { MaGV, MaMH } = req.body;

    try {
        // Kiểm tra xem giảng viên có tồn tại hay không
        const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
        const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

        if (giangVienResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
        }

        // Kiểm tra xem môn học có tồn tại trong khả năng dạy hay không
        const checkKhaNangDayQuery = `SELECT * FROM Day WHERE MaGV = '${MaGV}' AND MaMH = '${MaMH}'`;
        const khaNangDayResult = await pool.executeQuery(checkKhaNangDayQuery);

        if (khaNangDayResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy khả năng dạy' });
        }

        // Xoá môn học khỏi bảng Day
        const deleteKhaNangDayQuery = `DELETE FROM Day WHERE MaGV = '${MaGV}' AND MaMH = '${MaMH}'`;
        await pool.executeQuery(deleteKhaNangDayQuery);

        res.status(200).json({ success: true, message: 'Xoá khả năng dạy thành công' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllGiangVien,
    hienGiangVien,
    themGiangVien,
    suaGiangVien,
    xoaGiangVien,
    choGiangVienNghi,

    hienThiBangThoiGianBieu,

    dieuChinhBuoiCoTheDay, //đã fix

    hienThiBuoiChuaTheDay,
    hienThiBuoiCoTheDay,
    themBuoiCoTheDay,
    xoaBuoiCoTheDay,

    hienThiBangChuaPhanCongTheoGiangVien,
    hienThiBangPhanCongTheoGiangVien,
    phanCongGiangVien,
    xoaPhanCongGiangVien,

    dieuChinhKhaNangDay, //
    hienThiMonChuaTheDay,
    hienThiKhaNangDay,
    themKhaNangDay,
    xoaKhaNangDay,
};
