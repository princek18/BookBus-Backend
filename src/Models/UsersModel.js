const Mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");

const UserSchema = new Mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email.");
            }
        }
    },
    mobile: {
        type: String,
        required: true,
        length: 10
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error("Password can not contain 'password'");
            }
        }
    },
    wallet: {
        type: Number,
        default: 1000
    },
    userType: {
        type: String,
        required: true,
        default: "Normal"
    }
});

//This method runs while sending response.
UserSchema.methods.toJSON = function(){
    const user = this;
    const dataObject = user.toObject();

    delete dataObject.password;
    delete dataObject.wallet;

    return dataObject;
}

//This function runs before saving data to database.
UserSchema.pre('save', async function(next){
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8);
    }
    next();
})

const UsersModel = Mongoose.model("users", UserSchema);

module.exports = UsersModel;