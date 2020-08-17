const compareDate = (currentDate, prevDate) => {
	const cdStr = `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDate()}`
	const pdStr = `${prevDate.getFullYear()}${prevDate.getMonth()}${prevDate.getDate()}`
	return cdStr === pdStr;
}

module.exports = {
	compareDate
}