const pool = require('../config/database.js');
const sql = require('mssql');

const dotenv = require('dotenv');
dotenv.config();

class menuItemsDAO {
    async getAllDishCategories() {
        try {
            console.log('DishCategoriesDAO');
            const query = `SELECT * FROM DishCategories`;
            const result = await pool.request().query(query);
            return result.recordset;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getAllDishCategoriesWithMenuItems() {
        try {
            console.log('DishCategoriesDAO');
            const query = `
                SELECT 
                    DC.DishCategoryID, 
                    DC.Name AS CategoryName,
                    MI.MenuItemID, 
                    MI.Name AS MenuItemName, 
                    MI.Price, 
                    MI.ImageUrl
                FROM DishCategories AS DC
                LEFT JOIN MenuItems AS MI 
                    ON DC.DishCategoryID = MI.DishCategoryID
                ORDER BY DC.DishCategoryID, MI.Name
            `;
            const result = await pool.request().query(query);

            // Nhóm dữ liệu trả về theo DishCategoryID
            const groupedResult = result.recordset.reduce((acc, row) => {
                const categoryId = row.DishCategoryID;

                // Kiểm tra nếu chưa có categoryId, thêm mới
                if (!acc[categoryId]) {
                    acc[categoryId] = {
                        DishCategoryID: row.DishCategoryID,
                        Name: row.CategoryName,
                        menuItems: [],
                    };
                }

                // Thêm menuItem nếu có
                if (row.MenuItemID) {
                    acc[categoryId].menuItems.push({
                        id: row.MenuItemID,
                        name: row.MenuItemName,
                        price: row.Price,
                        imageUrl: row.ImageUrl,
                    });
                }

                return acc;
            }, {});

            // Trả về mảng thay vì object
            return Object.values(groupedResult);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = menuItemsDAO;
