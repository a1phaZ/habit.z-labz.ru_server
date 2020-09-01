const CronJob = require('cron').CronJob;

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
				console.log('Job Finished');
			}
		});
		this.jobCount = 0;
		this.habitId = habitId;
		this.habitTitle = habitTitle;
		this.userId = userId;
		this.count = count;
	}
}

module.exports = CronSchedule;