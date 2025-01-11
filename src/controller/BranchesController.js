const Database = require('../config/database.js');
const auth = require('../middleware/auth.js');
const bcrypt = require('bcrypt');
const upload = require('../middleware/multer.js');
const jwt = require('jsonwebtoken');
const pool = require('../config/database.js');
const validator = require('validator');
const dotenv = require('dotenv');

const DishCategories = require('../models/DishCategories.js');

const menuItemsDAO = require('../dao/MenuItemsDAO.js');
const menuItemDAO = new menuItemsDAO();

dotenv.config();

let getAllDishCategories = async (req, res) => {
    try {
        const dishCategories = await menuItemDAO.getAllDishCategories();
        res.status(200).json({ success: true, dishCategories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

let getAllDishCategoriesWithMenuItems = async (req, res) => {
    try {
        const dishCategoriesWithMenuItems = await menuItemDAO.getAllDishCategoriesWithMenuItems();
        res.status(200).json({ success: true, dishCategoriesWithMenuItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

module.exports = {
    getAllDishCategories,
    getAllDishCategoriesWithMenuItems,
};
