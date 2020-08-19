const compareDate = (currentDate, prevDate, createdAt) => {
	const caStr = `${createdAt.getFullYear()}${createdAt.getMonth()}${createdAt.getDate()}`
	const cdStr = `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDate()}`
	const pdStr = `${prevDate.getFullYear()}${prevDate.getMonth()}${prevDate.getDate()}`
	if (caStr === cdStr) {
		return false;
	}
	return cdStr === pdStr;
}

module.exports = {
	compareDate
}