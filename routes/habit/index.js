const express = require('express');
const router = express.Router();
const Habit = require('../../models/habit');
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
				if (habit.status !== 'active') {
					throw new Error('Данная цель уже выполнена');
				}

				const currentDate = new Date();
				const prevDate = new Date(habit.lastModified);
				if (compareDate(currentDate, prevDate)) {
					throw new Error('Отмечать цель можно раз в сутки');
				}

				habit.lastModified = new Date();
				habit.daysComplete = habit.daysComplete + 1;
				if (!(habit.days > habit.daysComplete)) {
					habit.daysComplete = habit.days;
					habit.status = 'done';
				}
				return habit.save();
			} else {
				throw new Error('По данному идентификатору цель не найдена');
			}
		})
		.then((saved) => {
			res.status(200).json(saved.toJSON());
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