import Jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from 'bcrypt'

export const registerUser = async (req, res) => {
    const { fullName, phoneNumber, email, password, address } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = new User({
            fullName,
            phoneNumber,
            email,
            password: hashedPassword,
            address,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {        
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
}



export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = Jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_KEY
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
}