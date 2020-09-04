const express = require('express');
const router = express.Router();
const Habit = require('../../models/habit');
const {CronSchedule, getCronTime} = require("../../handlers/cron");
const {objectToJson, ArrayToJson} = require("../../handlers/toJson");
const {format} = require("../../handlers/date");
const {checkMissMark} = require("../../handlers/date");
const {compareDate} = require("../../handlers/date");
const {createError} = require("../../handlers/error");

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
		cronSchedule: {
			cronTime: body.time,
			timeZoneOffset: body.timeZoneOffset
		}
	});
	await habit
		.save()
		.then(() => {
			if (habit.cronSchedule.cronTime) {
				const cronTime = getCronTime(habit.cronSchedule.cronTime, habit.cronSchedule.timeZoneOffset);
				const job = new CronSchedule(vk_user_id, habit._id, habit.title, cronTime, habit.days-habit.daysComplete);
				cronScheduleList.push(job);
				job.start();
			}
			return true;
		})
		.then(async () => {
			return await Habit.find({userId: vk_user_id});
		})
		.then(habits => {
			res.status(200).json({
				success: true,
				data: ArrayToJson(habits),
				error: null,
				message: 'Цель успешно создана'
			});
		})
		.catch(error => {
			next(createError(500, error.message));
		});
});

router.put('/:id', async (req, res, next) => {
	const {
		params: {id},
		query: {vk_user_id}
	} = req;

	const query = {_id: id, userId: vk_user_id};
	await Habit.findOne(query)
		.then(async habit => {
			if (habit) {
				const checkedHabit = checkMissMark(habit);
				if (checkedHabit.status !== 'active') {
					throw new Error('Данная цель уже выполнена');
				}

				const currentDate = new Date();
				const lastModifiedDate = new Date(checkedHabit.lastModified);
				const createdAt = new Date(checkedHabit.createdAt);
				if (compareDate(currentDate, lastModifiedDate, createdAt) || format(lastModifiedDate) === format(currentDate) && checkedHabit.daysComplete > 0) {
					throw new Error('Отмечать цель можно раз в сутки');
				}

				checkedHabit.lastModified = new Date();
				checkedHabit.daysComplete = checkedHabit.daysComplete + 1;
				if (!(checkedHabit.days > checkedHabit.daysComplete)) {
					checkedHabit.daysComplete = checkedHabit.days;
					checkedHabit.status = 'done';
				}
				return await checkedHabit.save();
			} else {
				throw new Error('По данному идентификатору цель не найдена');
			}
		})
		.then(async (saved) => {
			await res.status(200).json({
				success: true,
				data: objectToJson(saved),
				error: null,
				message: saved.daysComplete === saved.days ? 'Вы достигли поставленной цели! Поздравляем!' : 'На сегодня цель отмечена. Отличная работа!'
			});
		})
		.catch(error => next(error));
});

router.patch('/:id', async (req, res, next) => {
	const {
		params: {id},
		body: {
			title,
			days,
			timeZoneOffset,
			time
		},
		query: {vk_user_id}
	} = req;
	const update = {
		title,
		days,
		cronSchedule: {
			cronTime: time,
			timeZoneOffset: timeZoneOffset
		}
	}
	await Habit.findOneAndUpdate({_id: id, userId: vk_user_id}, update, {new: true})
		.then(async habit => {
			if (habit.cronSchedule.cronTime) {
				const cronTime = getCronTime(habit.cronSchedule.cronTime, habit.cronSchedule.timeZoneOffset);
				const schedule = await cronScheduleList.find(schedule => {
					return (schedule.userId.toString() === vk_user_id.toString() && schedule.habitId.toString() === id.toString())
				});
				if (schedule) {
					schedule.stop();
					const job = new CronSchedule(vk_user_id, habit._id, habit.title, cronTime, habit.days-habit.daysComplete);
					cronScheduleList.push(job);
					job.start();
				} else {
					const job = new CronSchedule(vk_user_id, habit._id, habit.title, cronTime, habit.days-habit.daysComplete);
					cronScheduleList.push(job);
					job.start();
				}
			}
		})
		.then(async () => {
			return await Habit.find({userId: vk_user_id});
		})
		.then(habits => {
			res.status(200).json({
				success: true,
				data: ArrayToJson(habits),
				error: null,
				message: 'Цель успешно обновлена'
			});
		})
		.catch(error => {
			next(createError(500, error.message));
		});
});

router.delete('/:id', async (req, res, next) => {
	const {
		params: {id},
		query: {vk_user_id}
	} = req;

	await Habit.deleteOne({_id: id, userId: vk_user_id})
		.then(async () => {
			return await cronScheduleList.find(schedule => {
				return (schedule.userId.toString() === vk_user_id.toString() && schedule.habitId.toString() === id.toString())
			});
		})
		.then((schedule) => {
			if (schedule) {
				schedule.stop();
			}
		})
		.then(async () => {
			return await Habit.find({userId: vk_user_id})
		})
		.then(async habits => {
			const ArrayToJson = habits.map(item => {
				return objectToJson(item);
			});
			await res.status(200).json({
				success: true,
				data: ArrayToJson,
				error: null,
				message: 'Цель удалена'
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