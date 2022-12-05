const getFilteredObject = (object, filterCallback) => {
	const filteredData = Object.entries(object).filter(filterCallback);
	return Object.fromEntries(filteredData);
}

module.exports = {
	getFilteredObject
}
