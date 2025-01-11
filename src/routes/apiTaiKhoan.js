const express = require('express');
const taiKhoanController = require('../controller/taiKhoanController');

const auth = require('../middleware/auth');

let Router = express.Router();

Router.post('/sign-in', taiKhoanController.signIn);
Router.post('/dangnhapNV', taiKhoanController.dangNhapNV);
Router.post('/sign-up', taiKhoanController.signUp);
Router.post('/doimatkhau', taiKhoanController.doiMatKhau);
Router.post('/checkmatkhautrung', taiKhoanController.checkMatKhauTrung);

module.exports = Router;
