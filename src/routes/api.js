const routerTaiKhoan = require('./apiTaikhoan');
const routerDienThoai = require('./apiDienThoai');
const routerLoai = require('./apiLoai');
const routerHang = require('./apiHang');
const routerKhachHang = require('./apiKhachHang');
const routerHoaDon = require('./apiHoaDon');
const routerPhieuDat = require('./apiPhieuDat');
const routerKhuyenMai = require('./apiKhuyenMai');

function initAPIRoute(app) {
    app.use('/api/v1/taikhoan', routerTaiKhoan);

    app.use('/api/v1/dienthoai', routerDienThoai);

    app.use('/api/v1/loai', routerLoai);

    app.use('/api/v1/hang', routerHang);

    app.use('/api/v1/khachhang', routerKhachHang);

    app.use('/api/v1/hoadon', routerHoaDon);

    app.use('/api/v1/phieudat', routerPhieuDat);

    app.use('/api/v1/khuyenmai', routerKhuyenMai);
    // app.use('/api/v1/order', routerOrder)
}

module.exports = initAPIRoute;
