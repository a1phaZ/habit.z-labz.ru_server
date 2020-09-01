const objectToJson = (obj) => {
	return {
		_id: obj._id,
		userId: obj.userId,
		title: obj.title,
		days: obj.days,
		daysComplete: obj.daysComplete,
		status: obj.status,
		notification: obj.cronSchedule.cronTime
	}
}

const ArrayToJson = (items) => items.map(item => {
	return objectToJson(item);
});

module.exports = {
	objectToJson,
	ArrayToJson
}