const compareDate = (currentDate, prevDate, createdAt) => {
	const caStr = `${createdAt.getFullYear()}${createdAt.getMonth()}${createdAt.getDate()}`
	const cdStr = `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDate()}`
	const pdStr = `${prevDate.getFullYear()}${prevDate.getMonth()}${prevDate.getDate()}`
	if (caStr === cdStr) {
		return false;
	}
	return cdStr === pdStr;
}

const checkMissMark = (item) => {
	const now = new Date();
	const itemDate = new Date(item.lastModified);
	item.daysComplete = now.getDate() - itemDate.getDate() > 1 ? 0 : item.daysComplete;
	return item;
}

const format = (str) => {
	const date = new Date(str);
	return `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
}

module.exports = {
	compareDate,
	checkMissMark,
	format
}