const {ObjectId} = require('mongoose').Types;
const {User, Thought, Reaction} = require('../models');
const {isEmail, isAlphanumeric} = require('validator');
// const { post } = require('../models/Reaction');

// Get All users
async function getUsers(req, res) {
    try {
        const users = await User.find();

        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    };
};

// Get One user
async function getOneUser(req, res) {
    try {
        if (!ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({error: 'No user with that ID'});
        };
        const user = await User.findOne({_id: req.params.userId})
                                    .select('-__v')
                                    .populate('thoughts')
                                    .populate('friends');
        
        if (!user) {
            return res.status(404).json({error: 'No user with that ID'});
        };

        res.status(200).json(user);

    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    };
};

// create a new user
// {
//     "username": "amiko",
//     "email": "amike@gmail.com"
// }
async function postUser(req, res) {
    try {
        if (!isEmail(req.body.email) || !isAlphanumeric(req.body.username)) 
            return res.status(400).json({ message: 'Input data is invalid'});
        const user = await User.create(req.body);
        res.json(user);
    } catch (error) {
        res.status(500).json(error);
    };
};

// update user
async function updateUser(req, res) {
    try {
        const user = await User.findOneAndUpdate(
            {_id: req.params.userId},
            { username: req.body.username, email: req.body.email}
        );

        if (!user) return res.status(404).json({message: 'No student found!'});

        res.json(user);
    } catch (error) {
        res.status(500).json(error);
    }
};

// delete a user by ID
async function deleteUser(req, res) {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.userId});
        if (!user) return res.status(404).json({message: 'User not exist'});
        return res.json({message: 'User successfully deleted'});
    } catch (error) {
        res.status(500).json(error);
    };
};

// add a new friend to a user's friend list
// /api/users/:userId/friends/:friendId
async function addFriend(req, res) {
    try {
        // check if Id is valid
        if (!ObjectId.isValid(req.params.userId) &&
            !ObjectId.isValid(req.params.friendId)) {
            return res.status(400).json({error: 'No user with that ID'});
        };

        // check if friendId exist
        const friend = await User.findOne({_id: req.params.friendId});                                    
        if (!friend) {
            return res.status(404).json({error: 'No user with that ID'});
        };

        // add friend to the user's friend list
        const user = await User.findOneAndUpdate(
            {_id: req.params.userId},
            {$addToSet: { friends: new ObjectId(req.params.friendId)}},
            {new: true}
        );

        if (!user) return res.status(404).json({message: 'No student found!'});

        res.json(user);
    } catch (error) {
        res.status(500).json(error);
    }
};

// remove a friend from a user's friend list
// /api/users/:userId/friends/:friendId
async function removeFriend(req, res) {
    try {
        // check if Id is valid and not friend of userself 
        if (!ObjectId.isValid(req.params.userId) ||
            !ObjectId.isValid(req.params.friendId) ||
            req.params.userId == req.params.friendId) {
            return res.status(400).json({error: 'No user with that ID'});
        };

        // remove friend from user's friend list
        const user = await User.findOneAndUpdate(
            {_id: req.params.userId},
            {$pull: {friends: new ObjectId(req.params.friendId)}},
            {new: true}
        );
        if (!user) return res.status(404).json({message: 'No student found!'});

        res.json(user);
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = {
    getUsers,
    getOneUser,
    postUser,
    updateUser,
    deleteUser,
    addFriend,
    removeFriend
};