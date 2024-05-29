const express = require('express');
const khachHangController = require('../controller/khachHangController');

const auth = require('../middleware/auth');

let Router = express.Router();

Router.get('/get-all-khachhang', khachHangController.getAllKhachHang);
Router.post('/update-thongtin-ngdung', khachHangController.capNhatThongTinNguoiDung);

module.exports = Router;
