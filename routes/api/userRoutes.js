const router = require('express').Router();
const {
    getUsers,
    getOneUser,
    postUser
} = require('../../controllers/userController');

// /api/users
router.route('/').get(getUsers).post(postUser);

// /api/users/:userId
router.route('/:userId').get(getOneUser);


module.exports = router;