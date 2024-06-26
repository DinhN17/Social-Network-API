const {ObjectId} = require('mongoose').Types;
const {User, Thought} = require('../models');
const {isEmpty, isMongoId, isAlphanumeric} = require('validator');

// Get all thoughts
async function getThoughts(req, res) {
    try {
        const thoughts = await Thought.find();
        // console.log(thoughts);
        console.log(thoughts);
        res.status(200).json(thoughts);
    } catch (error) {
        return res.status(500).json(error);
    };
};

// Get one thought
// /api/thoughts/:thoughtId
async function getOneThought(req, res) {
    try {
        if (!isMongoId(req.params.thoughtId)) {
            return res.status(400).json({error: 'No thought with that ID'});
        };
        const thought = await Thought.findOne({_id: req.params.thoughtId})
                                    .select('-__v')
                                    .populate('reactions');
        
        if (!thought) {
            return res.status(404).json({error: 'No thought with that ID'});
        };

        console.log(thought);
        res.status(200).json(thought);
    } catch (error) {
        return res.status(500).json(error);
    };
};

// create a new thought
// /api/thoughts
// {
//     "thoughtText": "Here's a cool thought...",
//     "username": "lernantino",
//     "userId": "5edff358a0fcb779aa7b118b"
// }
async function createThought(req, res) {
    try {
        // validate username, userId, thoughtText
        const { username, userId, thoughtText } = req.body;
        // console.log(!isMongoId(userId), !isEmpty(thoughtText), !isAlphanumeric(username));
        // console.log({username, userId, thoughtText});
        if (
            !isMongoId(userId) ||
            isEmpty(thoughtText) || 
            !isAlphanumeric(username)
        ) return res.status(400).json({ message: 'Input data is invalid'});

        // validate userId
        const user = await User.findOne({_id: userId});
        if (!user) return res.status(404).json({ message: 'User not found'});
        
        const body = {
            "thoughtText": thoughtText,
            "username": username,
            "reactions": []
        };
        
        // create Thought
        const thought = await Thought.create(body);

        // add thought to the user's thought list
        await User.findOneAndUpdate(
            {_id: userId},
            {$addToSet: { thoughts: thought._id}},
            {new: true}
        );
        console.log(thought);
        res.json(thought);
    } catch (error) {
        res.status(500).json(error);
    };
};

// update thought
// api/thoughts/:thoughtId
// { "thoughtText": "Here's a great thought..."}
async function updateThought(req, res) {
    try {
        // validate thoughtId
        if (!isMongoId(req.params.thoughtId)) {
            return res.status(400).json({error: 'No thought with that ID'});
        };

        const thought = await Thought.findOneAndUpdate(
            {_id: req.params.thoughtId},
            {thoughtText: req.body.thoughtText},
            {new: true}
        );

        if (!thought) {
            return res.status(404).json({error: 'No thought with that ID'});
        };

        console.log(thought);
        res.json(thought);
    } catch (error) {
        res.status(500).json(error);
    };
};

// delete thought
// /api/thoughts/:thoughtId
async function removeThought(req, res) {
    try {
        // validate thoughtId
        if (!isMongoId(req.params.thoughtId)) {
            return res.status(400).json({error: 'No thought with that ID'});
        };
        
        // delete Thought
        const thought = await Thought.findOneAndDelete({_id: req.params.thoughtId});
        
        if (!thought) {
            return res.status(404).json({error: 'No thought with that ID'});
        } else {
            // delete thought from the user's thought list
            await User.findOneAndUpdate(
                {username: thought.username},
                {$pull: {thoughts: thought._id}},
            );
        };

        res.status(200).json({message: 'Thought successfully deleted'});
    } catch (error) {
        res.status(500).json(error);
    };
};

// create a new reaction
// /api/thoughts/:thoughtId/reactions
// {
//     "reactionBody": "This thought is amazing!",
//     "username": "amiko",
// }
async function createReaction(req, res) {
    try {
        // validate thoughtId, reactionBody, username
        if (!isMongoId(req.params.thoughtId ||
            !isEmpty(req.body.reactionBody) ||
            !isAlphanumeric(req.body.username))) {
            return res.status(400).json({error: 'No thought with that ID'});
        };

        // add reaction to thought
        const body = {
            reactionBody: req.body.reactionBody,
            username: req.body.username
        };
        const reaction = await Thought.findOneAndUpdate(
            {_id: req.params.thoughtId},
            {$addToSet: {reactions: body}},
            {new: true}
        );
        if (!reaction) {
            return res.status(404).json({error: 'No thought with that ID'});
        };

        console.log(reaction);
        res.json(reaction);

    } catch (error) {
        res.status(500).json(error);
    };
};

// delete reaction
// /api/thoughts/:thoughtId/reactions/:reactionId
async function removeReaction(req, res) {
    try {
        // validate reactionId, thoughtId
        if (!isMongoId(req.params.thoughtId) ||
            !isMongoId(req.params.reactionId)) {
            return res.status(400).json({error: 'No thought with that ID'});
        };

        const reaction = await Thought.findOneAndUpdate(
            {_id: req.params.thoughtId},
            {$pull: {reactions: {_id: req.params.reactionId}}},
            {new: true}
        );

        if (!reaction) {
            return res.status(404).json({error: 'No reaction with that ID'});
        };

        console.log(reaction);
        res.json(reaction);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { 
    getThoughts, 
    getOneThought, 
    createThought, 
    updateThought, 
    removeThought, 
    createReaction, 
    removeReaction 
};