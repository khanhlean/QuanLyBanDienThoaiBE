const express = require('express');
const hangController = require('../controller/hangController');

const auth = require('../middleware/auth');

let Router = express.Router();

Router.get('/get-all-hang', hangController.getAllHang);
// Router.get('/get-3-dienthoai-bat-ki', dienThoaiController.get3DienThoaiBatKi);
// Router.get('/get-dienthoai-by-madt/:MaDT', dienThoaiController.getDienThoaiTheoMaDT);
// Router.delete('/xoa-dienthoai-by-madt/:MaDT', dienThoaiController.xoaDienThoai);

module.exports = Router;
