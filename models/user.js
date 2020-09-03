const mongoose = require('mongoose');
const {Schema, model} = mongoose;

mongoose.Promise = global.Promise;

const UserSchema = new Schema({
	userId: {type: String, require: true},
	allowNotification: {type: Boolean, default: false}
});

const User = model('User', UserSchema);

module.exports = User;