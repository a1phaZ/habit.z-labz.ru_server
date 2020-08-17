const mongoose = require('mongoose');
const {Schema, model} = mongoose;

mongoose.Promise = global.Promise;

const HabitSchema = new Schema({
	userId: { type: String, required: [true, 'Отсутствует идетификатор пользователя']},
	title: { type: String, required: [true, 'Отстуствует название цели']},
	days: { type: Number, required: [true, 'Отсутсвует кол-во дней']},
	lastModified: { type: Date, default: Date.now()},
	daysComplete: { type: Number, default: 0},
	status: {type: String, default: 'active'}
});

HabitSchema.methods.toJSON = function () {
	return {
		_id: this._id,
		userId: this.userId,
		title: this.title,
		days: this.days,
		daysComplete: this.daysComplete,
		status: this.status
	}
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