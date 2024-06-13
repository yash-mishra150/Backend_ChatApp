const Message = require('../models/messModel');
const User = require('../models/userScheme');


// Controller to handle fetching all messages
exports.getAllMessages = async (req, res) => {
    try {
        const { email, name } = req.query;

        // Construct the pipeline stages for the aggregation
        const pipeline = [];

        // Match stage based on email or name
        if (email) {
            pipeline.push({ $match: { userEmail: email } });
        } else if (name) {
            pipeline.push({
                $lookup: {
                    from: 'users', // Name of the User collection
                    localField: 'userEmail',
                    foreignField: 'email',
                    as: 'user'
                }
            });
            pipeline.push({ $unwind: '$user' }); // Unwind the user array
            pipeline.push({ $match: { 'user.name': name } });
        }

        // Add sorting stage
        pipeline.push({ $sort: { timestamp: 1 } });

        // Execute the aggregation pipeline
        const messages = await Message.aggregate(pipeline);

        res.status(200).json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
// Controller to handle creating a new message
exports.createMessage = async (req, res) => {
    const { text, email } = req.query;
    if (!text || !email) {
        return res.status(400).json({ error: 'text and email is required' });
    }

    const userExists = await User.findOne({ email });

    if (!userExists) {
        res.status(400);
        throw new Error("User does not exist");
    }


    try {
        const newMessage = new Message({ text, userEmail: email });
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (err) {
        console.error('Error creating message:', err);
        res.status(500).json({ error: 'Failed to create message' });
    }
};
