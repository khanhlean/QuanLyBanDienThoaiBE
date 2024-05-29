const express = require('express');
const dienThoaiController = require('../controller/dienThoaiController');

const auth = require('../middleware/auth');

let Router = express.Router();

Router.get('/get-all-dienthoai', dienThoaiController.getAllDienThoai);
Router.get('/get-3-dienthoai-bat-ki', dienThoaiController.get3DienThoaiBatKi);
Router.get('/get-dienthoai-by-madt/:MaDT', dienThoaiController.getDienThoaiTheoMaDT);
Router.post('/them-dienthoai', dienThoaiController.themDienThoai);
Router.delete('/xoa-dienthoai-by-madt/:MaDT', dienThoaiController.xoaDienThoai);

module.exports = Router;
