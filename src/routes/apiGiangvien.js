const express = require('express');
const giangVienController = require('../controller/giangVienController');

const auth = require('../middleware/auth');

let Router = express.Router();

Router.get('/getallgiangvien', giangVienController.getAllGiangVien);
//Router.get('/hienGiangVien/:MaGV',auth.verifyTokenQuanLi,giangVienController.hienGiangVien)
Router.post('/themgiangvien', giangVienController.themGiangVien);
Router.put('/suaGiangVien/:Magv', auth.verifyTokenQuanLi, giangVienController.suaGiangVien);
Router.delete('/xoaGiangVien/:Magv', auth.verifyTokenQuanLi, giangVienController.xoaGiangVien);
Router.put('/choGiangVienNghi/:MaGV', auth.verifyTokenQuanLi, giangVienController.choGiangVienNghi);
Router.get('/hienThiBangThoiGianBieu', auth.verifyTokenQuanLi, giangVienController.hienThiBangThoiGianBieu);
Router.post('/dieuChinhBuoiCoTheDay', auth.verifyTokenQuanLi, giangVienController.dieuChinhBuoiCoTheDay);
Router.get('/hienThiBuoiChuaTheDay/:MaGV', auth.verifyTokenQuanLi, giangVienController.hienThiBuoiChuaTheDay);
Router.get('/hienThiBuoiCoTheDay/:MaGV', auth.verifyTokenQuanLi, giangVienController.hienThiBuoiCoTheDay);

Router.post('/themBuoiCoTheDay', auth.verifyTokenQuanLi, giangVienController.themBuoiCoTheDay);
Router.post('/xoaBuoiCoTheDay', auth.verifyTokenQuanLi, giangVienController.xoaBuoiCoTheDay);

Router.get(
    '/hienThiBangChuaPhanCongTheoGiangVien/:MaGV',
    auth.verifyTokenQuanLi,
    giangVienController.hienThiBangChuaPhanCongTheoGiangVien,
);
Router.get(
    '/hienThiBangPhanCongTheoGiangVien/:MaGV',
    auth.verifyTokenQuanLi,
    giangVienController.hienThiBangPhanCongTheoGiangVien,
);
Router.post('/phanCongGiangVien', auth.verifyTokenQuanLi, giangVienController.phanCongGiangVien);
Router.post('/xoaPhanCongGiangVien', auth.verifyTokenQuanLi, giangVienController.xoaPhanCongGiangVien);

Router.post('/dieuChinhKhaNangDay', auth.verifyTokenQuanLi, giangVienController.dieuChinhKhaNangDay);

Router.get('/hienThiMonChuaTheDay/:MaGV', auth.verifyTokenQuanLi, giangVienController.hienThiMonChuaTheDay);
Router.get('/hienThiKhaNangDay/:MaGV', auth.verifyTokenQuanLi, giangVienController.hienThiKhaNangDay);

Router.post('/themKhaNangDay', auth.verifyTokenQuanLi, giangVienController.themKhaNangDay);
Router.post('/xoaKhaNangDay', auth.verifyTokenQuanLi, giangVienController.xoaKhaNangDay);

module.exports = Router;
