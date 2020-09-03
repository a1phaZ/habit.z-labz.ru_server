const CronJob = require('cron').CronJob;
const Habit = require('../models/habit');

class CronSchedule extends CronJob {
	constructor(userId, habitId, habitTitle, cronTime, count) {
		super({
			cronTime,
			onTick: () => {
				if (this.jobCount < this.count) {
					this.jobCount++;
					console.log(`Task for User: ${userId}. ${this.habitTitle}:${habitId}`);
				} else {
					this.stop();
				}
			},
			onComplete: () => {
				console.log(`Task for User: ${userId}. ${this.habitTitle}:${habitId} Finished`);
			}
		});
		this.jobCount = 0;
		this.habitId = habitId;
		this.habitTitle = habitTitle;
		this.userId = userId;
		this.count = count;
	}
}

const getCronTime = (str, timeZoneOffset) => {
	const hour = str.match(/^[0-9]{2}/);
	const minute = str.match(/[0-9]{2}$/);
	const serverTZ = new Date().getTimezoneOffset()/60;
	const habitTZ = timeZoneOffset/60;
	const hourWithTZ = Number(hour) + habitTZ - serverTZ;
	return `00 ${minute} ${hourWithTZ} * * *`;
}

const fillAndStartSchedule = () => {
	Habit.find({status: 'active'})
		.then((list) => {
			list.forEach((item) => {
				if (item.cronSchedule.cronTime) {
					const job = new CronSchedule(item.userId, item._id, item.title, getCronTime(item.cronSchedule.cronTime, item.cronSchedule.timeZoneOffset), item.days-item.daysComplete);
					job.start();
					cronScheduleList.push(job);
				}
			})
		})
}

module.exports = {
	CronSchedule,
	getCronTime,
	fillAndStartSchedule
};