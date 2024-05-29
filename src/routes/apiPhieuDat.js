const express = require('express');
const phieuDatController = require('../controller/phieuDatController');

const auth = require('../middleware/auth');

let Router = express.Router();

Router.get('/get-all-phieudat', phieuDatController.getAllPhieuDat);
Router.post('/them-phieudat', phieuDatController.themPhieuDat);
Router.get('/get-phieudat-by-makh/:MaKH', phieuDatController.getPhieuDatbyMaKH);
Router.delete('/xoa-phieudat-by-mapd/:MaPD', phieuDatController.xoaPhieuDat);
Router.put('/update-trangthai-by-mapd/:MaPD', phieuDatController.updateTrangThai);

module.exports = Router;
