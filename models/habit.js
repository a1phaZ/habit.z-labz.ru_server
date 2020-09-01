const mongoose = require('mongoose');
const {objectToJson} = require("../handlers/toJson");
const {Schema, model} = mongoose;

mongoose.Promise = global.Promise;

const HabitSchema = new Schema({
	userId: { type: String, required: [true, 'Отсутствует идетификатор пользователя']},
	title: { type: String, required: [true, 'Отстуствует название цели']},
	days: { type: Number, required: [true, 'Отсутсвует кол-во дней']},
	lastModified: { type: Date, default: Date.now()},
	daysComplete: { type: Number, default: 0},
	status: {type: String, default: 'active'},
	cronSchedule: {
		cronTime: {
			type: String
		},
		timeZoneOffset: {
			type: Number
		}
	}
}, {timestamps: true});

HabitSchema.methods.toJSON = function () {
	return objectToJson(this);
}

const Habit = model('Habit', HabitSchema);

module.exports = Habit;

// habit: {
// 	title: title,
// 		days: days,
// 		lastModified: new Date(),
// 		daysComplete: 0,
// 		status: 'active' // active || done
// }