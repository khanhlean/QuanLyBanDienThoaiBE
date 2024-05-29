const express = require('express');
const khuyenMaiController = require('../controller/khuyenMaiController');

const auth = require('../middleware/auth');

let Router = express.Router();

Router.get('/get-dt-khuyenmai', khuyenMaiController.getDTKhuyenMai);
Router.get('/check-dt-khuyenmai/:MaDT', khuyenMaiController.checkDTCoKM);

// Router.get('/get-3-dienthoai-bat-ki', dienThoaiController.get3DienThoaiBatKi);
// Router.get('/get-dienthoai-by-madt/:MaDT', dienThoaiController.getDienThoaiTheoMaDT);

module.exports = Router;
