import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Password Collection for master passwords for role
const PasswordSchema = new mongoose.Schema({
    type: String,
    password: String
});

// Possible create MongoDB Document to query
export const password = mongoose.model('Password', PasswordSchema);
