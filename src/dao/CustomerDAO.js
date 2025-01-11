const pool = require('../config/database.js');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const Customer = require('../models/Customer');
const validator = require('validator');

const dotenv = require('dotenv');
dotenv.config();

class CustomerDAO {
    async findByEmail(email) {
        try {
            const query = `SELECT * FROM Customers WHERE Email = @email`;
            const result = await pool.request().input('email', sql.NVarChar(50), email).query(query);
            return result.recordset[0];
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async findByPhoneNumber(phone) {
        try {
            const query = `SELECT * FROM Customers WHERE Phone = @phone`;
            const result = await pool.request().input('phone', sql.NVarChar(15), phone).query(query);
            return result.recordset[0];
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async comparePassword(password, hashedPassword) {
        try {
            console.log(await bcrypt.compare(password, hashedPassword));
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async signUpCustomer({ HovaTen, Email, SDT, DiaChi, Password }) {
        console.log(HovaTen, Email, SDT, DiaChi, Password);
        if (!HovaTen || !DiaChi || !SDT || !Email || !Password) {
            return { success: false, message: process.env.CUSSIGNUP_E001 };
        }

        if (SDT.length < 10 || !/^[0-9]*$/.test(SDT)) {
            return { success: false, message: process.env.CUSSIGNUP_VALIDATOR_SDT };
        }

        if (!validator.isEmail(Email)) {
            return { success: false, message: process.env.CUSSIGNUP_VALIDATOR_EMAIL };
        }

        const phoneQuery = `SELECT COUNT(*) AS phoneCount FROM Customers WHERE Phone = @SDT`;
        const emailQuery = `SELECT COUNT(*) AS emailCount FROM Customers WHERE Email = @Email`;

        try {
            const phoneResult = await pool.request().input('SDT', sql.NVarChar(15), SDT).query(phoneQuery);
            const emailResult = await pool.request().input('Email', sql.NVarChar(50), Email).query(emailQuery);

            if (phoneResult.recordset[0].phoneCount > 0) {
                return { success: false, message: process.env.CUSSIGNUP_ERROR_SDT };
            }

            if (emailResult.recordset[0].emailCount > 0) {
                return { success: false, message: process.env.CUSSIGNUP_ERROR_EMAIL };
            }

            const hashedPassword = await bcrypt.hash(Password, 10);

            const insertQuery = `
          INSERT INTO Customers (FullName, Email, Phone, Address, Password)
          VALUES (@FullName, @Email, @Phone, @Address, @Password)
        `;

            await pool
                .request()
                .input('FullName', sql.NVarChar(50), HovaTen)
                .input('Email', sql.NVarChar(50), Email)
                .input('Phone', sql.NVarChar(15), SDT)
                .input('Address', sql.NVarChar(255), DiaChi)
                .input('Password', sql.NVarChar(255), hashedPassword)
                .query(insertQuery);

            return { success: true, message: process.env.CUSSIGNUP_SUCCESS };
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    async getCustomerProfile(userId) {
        try {
            const query = `SELECT * FROM KHACHHANG WHERE MaKH = @userId`;
            const result = await pool.request().input('userId', sql.Int, userId).query(query);

            const customer = result.recordset[0];

            if (!customer) {
                return { success: false, message: process.env.GETCUS_E001 };
            }

            return { success: true, customer };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async updateCustomerProfile(userId, { Ho, Ten, GioiTinh, NgaySinh, DiaChi, Email, SDT, Password }) {
        if (!Ho || !Ten || !NgaySinh || !DiaChi || !Email || !Password) {
            return { success: false, message: process.env.CUSSIGNUP_E001 };
        }
        if (SDT.length < 10 || !/^[0-9]*$/.test(SDT)) {
            return { success: false, message: process.env.CUSSIGNUP_VALIDATOR_SDT };
        }

        if (!validator.isEmail(Email)) {
            return { success: false, message: process.env.CUSSIGNUP_VALIDATOR_EMAIL };
        }
        try {
            // Check if the user exists
            const userQuery = `SELECT * FROM KHACHHANG WHERE MaKH = @userId`;
            const userResult = await pool.request().input('userId', sql.Int, userId).query(userQuery);
            const user = userResult.recordset[0];

            if (!user) {
                return { success: false, message: process.env.GETCUS_E001 };
            }

            // Check if the phone number already exists in the database
            const checkPhoneNumberQuery = `SELECT * FROM KHACHHANG WHERE SDT = @SDT AND MaKH != @userId`;
            const phoneNumberResult = await pool
                .request()
                .input('SDT', sql.NVarChar(15), SDT)
                .input('userId', sql.Int, userId)
                .query(checkPhoneNumberQuery);
            const existingUserWithPhoneNumber = phoneNumberResult.recordset[0];
            if (existingUserWithPhoneNumber) {
                return { success: false, message: process.env.CUSSIGNUP_PHONE_EXISTS };
            }

            // Update the user's profile data in the database
            let updateQuery = `
          UPDATE KHACHHANG
          SET Ho = @Ho, Ten = @Ten, GioiTinh = @GioiTinh, NgaySinh = @NgaySinh, DiaChi = @DiaChi, Email = @Email, SDT = @SDT
          WHERE MaKH = @userId
        `;

            // Only update the password if it is provided
            if (Password) {
                updateQuery = `
            UPDATE KHACHHANG
            SET Ho = @Ho, Ten = @Ten, GioiTinh = @GioiTinh, NgaySinh = @NgaySinh, DiaChi = @DiaChi, Email = @Email, Password = @password
            WHERE MaKH = @userId
          `;
            }

            await pool
                .request()
                .input('Ho', sql.NVarChar(50), Ho)
                .input('Ten', sql.NVarChar(20), Ten)
                .input('GioiTinh', sql.Bit, GioiTinh)
                .input('NgaySinh', sql.Date, NgaySinh)
                .input('DiaChi', sql.NVarChar(200), DiaChi)
                .input('Email', sql.NVarChar(50), Email)
                .input('password', sql.NVarChar(255), Password) // Add password input here
                .input('userId', sql.Int, userId)
                .query(updateQuery);

            return { success: true, message: process.env.UPDATE_SUCCESS };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async updateCustomerPassword(userId, newPassword) {
        try {
            // Check if the user exists
            const userQuery = `SELECT * FROM KHACHHANG WHERE MaKH = @userId`;
            const userResult = await pool.request().input('userId', sql.Int, userId).query(userQuery);
            const user = userResult.recordset[0];

            if (!user) {
                return { success: false, message: process.env.GETCUS_E001 };
            }

            // Update the user's password in the database
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updateQuery = `
          UPDATE KHACHHANG
          SET Password = @hashedPassword
          WHERE MaKH = @userId
        `;

            await pool
                .request()
                .input('hashedPassword', sql.NVarChar(255), hashedPassword)
                .input('userId', sql.Int, userId)
                .query(updateQuery);

            return { success: true, message: process.env.UPDATEPASS_SUCCESS };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async placeOrder(userId, lastName, firstName, address, phoneNumber, cartItems) {
        try {
            // Begin a transaction
            const transaction = new sql.Transaction(pool);

            try {
                // Start the transaction
                await transaction.begin();

                // Insert into PHIEUDAT table
                const orderQuery = `INSERT INTO PHIEUDAT (NgayDat, HoNN, TenNN, DiaChiNN, SDT, TrangThai, MaKH) 
                              VALUES (GETDATE(), @HoNN, @TenNN, @DiaChiNN, @SDT, 0, @MaKH);
                              SELECT SCOPE_IDENTITY() AS NewOrderID;`;

                const orderResult = await transaction
                    .request()
                    .input('HoNN', sql.NVarChar(50), lastName)
                    .input('TenNN', sql.NVarChar(20), firstName)
                    .input('DiaChiNN', sql.NVarChar(200), address)
                    .input('SDT', sql.NVarChar(15), phoneNumber)
                    .input('MaKH', sql.Int, userId)
                    .query(orderQuery);

                const orderId = orderResult.recordset[0].NewOrderID;

                // Insert into CTPHIEUDAT table
                for (const item of cartItems) {
                    const cartItemQuery = `INSERT INTO CTPHIEUDAT (MaPD, MaDH, SoLuong, DonGia) 
                                   VALUES (@MaPD, @MaDH, @SoLuong, @DonGia);`;

                    await transaction
                        .request()
                        .input('MaPD', sql.Int, orderId)
                        .input('MaDH', sql.NVarChar(10), item.productId)
                        .input('SoLuong', sql.Int, item.quantity)
                        .input('DonGia', sql.Float, item.price)
                        .query(cartItemQuery);
                }

                // Commit the transaction
                await transaction.commit();

                // Return the successful response
                return { success: true, message: process.env.ODER_SUCCESS, MaPD: orderId };
            } catch (error) {
                // Rollback the transaction if there's an error
                await transaction.rollback();
                console.error(error);
                return { success: false, message: process.env.ODER_ERROR };
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async cancelOrder(orderId) {
        try {
            // Begin a transaction
            const transaction = new sql.Transaction(pool);

            try {
                // Start the transaction
                await transaction.begin();

                // Retrieve order details
                const getOrderQuery = `SELECT TrangThai FROM PHIEUDAT WHERE MaPD = @MaPD;`;
                const getOrderResult = await transaction.request().input('MaPD', sql.Int, orderId).query(getOrderQuery);

                if (!getOrderResult.recordset[0]) {
                    // Order not found
                    return { success: false, message: process.env.ODER_E001 };
                }

                const orderStatus = getOrderResult.recordset[0].TrangThai;

                if (orderStatus === 4) {
                    // Order is already canceled
                    return { success: false, message: process.env.ODER_CANCEL_ER1 };
                }

                // Update TrangThai to 4 (canceled)
                const cancelOrderQuery = `UPDATE PHIEUDAT SET TrangThai = 4 WHERE MaPD = @MaPD;`;
                await transaction.request().input('MaPD', sql.Int, orderId).query(cancelOrderQuery);

                // Commit the transaction
                await transaction.commit();

                return { success: true, message: process.env.ODER_CANCEL_SUCCESS };
            } catch (error) {
                // Rollback the transaction if there's an error
                await transaction.rollback();
                console.error(error);
                return { success: false, message: process.env.ERROR_E001 };
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getOrderById(orderId, userId) {
        try {
            const query = `
          SELECT pd.*, ctpd.SoLuong, ctpd.DonGia,
          GIW.TenDH, GIW.HinhAnh
          FROM PHIEUDAT pd
          INNER JOIN CTPHIEUDAT ctpd ON pd.MaPD = ctpd.MaPD
          INNER JOIN GetInfoWatches GIW ON ctpd.MaDH = GIW.MaDH
          WHERE pd.MaPD = @orderId
        `;

            const result = await pool.request().input('orderId', sql.Int, orderId).query(query);
            const orderDetails = result.recordset;

            if (!orderDetails || orderDetails.length === 0) {
                return { success: false, message: process.env.ODER_E001 };
            }

            if (userId && userId !== orderDetails[0].MaKH) {
                return { success: false, message: process.env.UNAUTHORIZED_ERROR };
            }

            const formattedOrderDetails = {
                MaPD: orderDetails[0].MaPD,
                NgayDat: orderDetails[0].NgayDat,
                HoNN: orderDetails[0].HoNN,
                TenNN: orderDetails[0].TenNN,
                DiaChiNN: orderDetails[0].DiaChiNN,
                SDT: orderDetails[0].SDT,
                NgayGiao: orderDetails[0].NgayGiao,
                TrangThai: orderDetails[0].TrangThai,
                MaKH: orderDetails[0].MaKH,
                MaNVDuyet: orderDetails[0].MaNVDuyet,
                MaNVGiao: orderDetails[0].MaNVGiao,
                MaGiaoDich: orderDetails[0].MaGiaoDich,
                ChiTietPD: orderDetails.map((item) => ({
                    SoLuong: item.SoLuong,
                    DonGia: item.DonGia,
                    TenDH: item.TenDH,
                    HinhAnh: item.HinhAnh,
                })),
            };

            return { success: true, orderDetails: formattedOrderDetails };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getOrdersByCustomerId(userId) {
        try {
            const query = `
          SELECT pd.*, ctpd.SoLuong, ctpd.DonGia,
          GIW.TenDH, GIW.HinhAnh
          FROM PHIEUDAT pd
          INNER JOIN CTPHIEUDAT ctpd ON pd.MaPD = ctpd.MaPD
          INNER JOIN DONGHO DH ON ctpd.MaDH = DH.MaDH
          INNER JOIN GetInfoWatches GIW ON ctpd.MaDH = GIW.MaDH
          WHERE pd.MaKH = @userId
          ORDER BY pd.NgayDat DESC;
        `;

            const result = await pool.request().input('userId', sql.Int, userId).query(query);
            const orders = result.recordset;

            if (!orders || orders.length === 0) {
                return { success: false, message: process.env.ODER_E001 };
            }

            const formattedOrders = [];

            orders.forEach((order) => {
                const existingOrder = formattedOrders.find((item) => item.MaPD === order.MaPD);

                if (existingOrder) {
                    existingOrder.ChiTietPD.push({
                        SoLuong: order.SoLuong,
                        DonGia: order.DonGia,
                        TenDH: order.TenDH,
                        HinhAnh: order.HinhAnh,
                    });
                } else {
                    formattedOrders.push({
                        MaPD: order.MaPD,
                        NgayDat: order.NgayDat,
                        DiaChiNN: order.DiaChiNN,
                        TrangThai: order.TrangThai,
                        ChiTietPD: [
                            {
                                SoLuong: order.SoLuong,
                                DonGia: order.DonGia,
                                TenDH: order.TenDH,
                                HinhAnh: order.HinhAnh,
                            },
                        ],
                    });
                }
            });

            return { success: true, orders: formattedOrders };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = CustomerDAO;
