const mongoose = require('mongoose');
const User = require('./server/src/models/User');
const jwt = require('jsonwebtoken');

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/causeconn');
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'shabahatsyed101@gmail.com' });
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User details:', {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      });
      
      // Test JWT token creation
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      console.log('Generated JWT token:', token.substring(0, 50) + '...');
      
      // Test JWT token verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Decoded JWT:', decoded);
    } else {
      console.log('User not found, creating one...');
      const newUser = new User({
        email: 'shabahatsyed101@gmail.com',
        passwordHash: 'mock-password-hash',
        name: 'shabahat',
        role: 'sponsor'
      });
      await newUser.save();
      console.log('User created successfully');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser(); 