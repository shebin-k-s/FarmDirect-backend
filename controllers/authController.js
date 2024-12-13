import Jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from 'bcrypt'

export const registerUser = async (req, res) => {
    const { fullName, phoneNumber, email, password, address } = req.body;

    try {
        if (!fullName || !password || !address || !phoneNumber || !email) {
            return res.status(400).json({ message: "All fields are provided" });

        }
        const existingUser = await User.findOne({
            $or: [
                { phoneNumber },
                { email }
            ]
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or Phone number is already registered' });
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
        console.log(error);

        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
}



export const loginUser = async (req, res) => {
    const { email, phoneNumber, password } = req.body;

    try {
        const query = {};
        if (email) {
            query.email = email;
        } else if (phoneNumber) {
            query.phoneNumber = phoneNumber;
        }
        const user = await User.findOne(query);
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
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                email: user.email,
                address: user.address,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
}