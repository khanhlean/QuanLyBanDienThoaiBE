class Customer {
    constructor({ MaKH, Ho, Ten, DiaChi, SDT, Email, Password, MaQuyen }) {
        this.MaKH = MaKH;
        this.Ho = Ho;
        this.Ten = Ten;
        this.DiaChi = DiaChi;
        this.SDT = SDT;
        this.Email = Email;
        this.Password = Password;
        this.MaQuyen = MaQuyen;
    }
}

module.exports = Customer;
