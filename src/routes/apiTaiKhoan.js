const express = require('express');
const taiKhoanController = require('../controller/taiKhoanController');

const auth = require('../middleware/auth');

let Router = express.Router();

Router.post('/dangnhap', taiKhoanController.dangNhap);
Router.post('/dangnhapNV', taiKhoanController.dangNhapNV);
Router.post('/dangky', taiKhoanController.dangKy);
Router.post('/doimatkhau', taiKhoanController.doiMatKhau);
Router.post('/checkmatkhautrung', taiKhoanController.checkMatKhauTrung);

module.exports = Router;
