const express = require('express');
const router = express.Router();
const Habit = require('../../models/habit');
const {format} = require("../../handlers/date");
const {checkMissMark} = require("../../handlers/date");
const {compareDate} = require("../../handlers/date");
const {createError} = require("../../handlers/error");

const habitToJson = (item) => {
	return {
		_id: item._id,
		userId: item.userId,
		title: item.title,
		days: item.days,
		daysComplete: item.daysComplete,
		status: item.status
	}
};

const ArrayToJson = (items) => items.map(item => {
	return habitToJson(item);
});

router.get('/', async (req, res, next) => {
	const {
		query: {
			vk_user_id
		}
	} = req;

	await Habit.find({userId: vk_user_id})
		.then(habits => {
			return habits.map(habit => {
				return checkMissMark(habit);
			})
		})
		.then(habits => {
			res.status(200).json({
				success: true,
				data: ArrayToJson(habits),
				error: null,
			});
		})
		.catch(error => next(error));
});

router.post('/', async (req, res, next) => {
	const {
		body,
		query: {vk_user_id}
	} = req;
	const habit = new Habit({
		userId: vk_user_id,
		title: body.title,
		days: body.days,
	});
	await habit
		.save()
		.then(async () => {
			return await Habit.find({userId: vk_user_id});
		})
		.then(habits => {
			res.status(200).json({
				success: true,
				data: ArrayToJson(habits),
				error: null,
			});
		})
		.catch(error => {
			next(createError(500, error.message));
		});
});

router.put('/:id', async (req, res, next) => {
	const {
		params: { id },
		query: {vk_user_id}
	} = req;

	const query = {_id: id, userId: vk_user_id};
	await Habit.findOne(query)
		.then(habit => {
			if (habit) {
				const checkedHabit = checkMissMark(habit);
				if (checkedHabit.status !== 'active') {
					throw new Error('Данная цель уже выполнена');
				}

				const currentDate = new Date();
				const lastModifiedDate = new Date(checkedHabit.lastModified);
				const createdAt = new Date(checkedHabit.createdAt);
				if (compareDate(currentDate, lastModifiedDate, createdAt) || format(lastModifiedDate)===format(currentDate) && checkedHabit.daysComplete>0) {
					throw new Error('Отмечать цель можно раз в сутки');
				}

				checkedHabit.lastModified = new Date();
				checkedHabit.daysComplete = checkedHabit.daysComplete + 1;
				if (!(checkedHabit.days > checkedHabit.daysComplete)) {
					checkedHabit.daysComplete = checkedHabit.days;
					checkedHabit.status = 'done';
				}
				return checkedHabit.save();
			} else {
				throw new Error('По данному идентификатору цель не найдена');
			}
		})
		.then((saved) => {
			res.status(200).json({
				success: true,
				data: habitToJson(saved),
				error: null,
			});
		})
		.catch(error => next(error));
});

router.delete('/:id', async (req, res, next) => {
	const {
		params: { id },
		query: { vk_user_id }
	} = req;

	await Habit.deleteOne({ _id: id, userId: vk_user_id})
		.then(async () => {
			return await Habit.find({userId: vk_user_id})
		})
		.then(habits => {
			const ArrayToJson = habits.map(item => {
				return habitToJson(item);
			});
			res.status(200).json({
				success: true,
				data: ArrayToJson,
				error: null,
			});
		})
		.catch(error => next(error));
})

module.exports = router;
// habit: {
// 	title: title,
// 		days: days,
// 		lastModified: new Date(),
// 		daysComplete: 0,
// 		status: 'active' // active || done
// }