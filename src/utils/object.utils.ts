export const getFilteredObject = (object: object, filterCallback: (args: [string, any]) => boolean): object => {
	const filteredData = Object.entries(object).filter(filterCallback);
	return Object.fromEntries(filteredData);
}
