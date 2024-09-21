const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Define the User schema

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email:{
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ],
    },
    password:{
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Exclude password from query result by default
    },
    // Optional : Add roles for authorizaion(admin)
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    //Optional: Track users saved movies    
    savedMovies:[{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}],
}, {timestamps: true});

// Pre-Save Middleware to hash password before saving

userSchema.pre('save', async function(next){
    //Only hash the password if it has been modified or is new
    if(!this.isModified('password')) {
        return next();
    }

    try {
        //Generate a salt
        const salt = await bcrypt.genSalt(10);
        //Hash the password
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

//Instance Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

//Complete the User model from the schema
const User = mongoose.model('User', userSchema);
module.exports = User;  
