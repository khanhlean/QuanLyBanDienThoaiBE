const express = require('express');
const loaiController = require('../controller/loaiController');

const auth = require('../middleware/auth');

let Router = express.Router();

Router.get('/get-all-loai', loaiController.getAllLoai);
Router.get('/get-all-nhanvien', loaiController.getAllNhanVien);

Router.post('/them-loai', loaiController.themLoai);
Router.put('/sua-loai-by-maloai/:MaLoai', loaiController.suaLoai);
Router.delete('/xoa-loai-by-maloai/:MaLoai', loaiController.xoaLoai);

module.exports = Router;
