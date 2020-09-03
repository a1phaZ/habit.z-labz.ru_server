const {createError} = require("./error");
const User = require('../models/user');

module.exports = (req, res, next) => {
	const {
		query: {vk_user_id, vk_are_notifications_enabled}
	} = req;
	User.findOneAndUpdate({userId: vk_user_id}, {allowNotification: vk_are_notifications_enabled}, {upsert: true})
		.then(() => {
			next();
		})
		.catch((error) => {
			console.log(error);
			next(createError(500, 'Что-то пошло не так, мы уже разбираеся с этой проблемой'));
		});
}