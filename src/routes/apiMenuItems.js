const express = require('express');
const menuItemsController = require('../controller/MenuItemsController');

const auth = require('../middleware/auth');

let Router = express.Router();

Router.get('/get-all-dishcategories', menuItemsController.getAllDishCategories);
Router.get('/get-all-dishcategorieswithmenuitems', menuItemsController.getAllDishCategoriesWithMenuItems);

module.exports = Router;
