const express = require('express');
const hoaDonController = require('../controller/hoaDonController');

const auth = require('../middleware/auth');

let Router = express.Router();

Router.get('/get-all-hoadon', hoaDonController.getAllHoaDon);
Router.post('/them-hoadon', hoaDonController.themHoaDon);
Router.delete('/xoa-hoadon/:MaHD', hoaDonController.xoaHoaDon);

module.exports = Router;
