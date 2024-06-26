const { Schema, model } = require('mongoose');
const Reaction = require('./Reaction');
const dayjs = require('dayjs');
var advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const thoughtSchema = new Schema(
    {
        thoughtText: {
            type: String,
            required: true,
            maxlength: 280,
            minlength: 1
        },
        createdAt: {
            type: Date,
            default: Date.now,
            get: (createdAtVal) => dayjs(createdAtVal).format('MMM Do, YYYY [at] hh:mm a')
        },
        username: {
            type: String,
            required: true
        },
        reactions: [Reaction]
    },
    {
        toJSON: {
            getters: true
            // virtuals: true,
            // getters: true
        },
        id: false
    }
);

thoughtSchema.virtual('reactionCount').get(function () {
    return this.reactions.length;
});

const Thought = model('thought', thoughtSchema);

module.exports = Thought;