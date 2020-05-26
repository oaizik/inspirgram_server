const { Router } = require('express');
const UsersRouter = new Router();
const {
    getUserById,
    authEmailUser,
    addUser,
    addFacebookUser,
    updateUser,
    deleteUser } = require('../controllers/UsersController');

//path = /users/
UsersRouter.get('/', getUserById);

//path = /users/auth
UsersRouter.post('/auth', authEmailUser);

//path = /users
UsersRouter.post('/', addUser);

//path = /users/facebookUser
UsersRouter.post('/facebookUser', addFacebookUser);

//path = /users/
UsersRouter.put('/', updateUser);

//path = /users/
UsersRouter.delete('/', deleteUser);

module.exports = UsersRouter;
