import _ from "lodash";

export const capitalizeStringIfUppercase = (value: string) => {
	if (value.toUpperCase() === value) {
		return _.upperFirst();
	} else {
		return value;
	}
};

export function getValidMonths(askedDate: Date, start: Date, n: number) {
	let year = askedDate.getFullYear();
	let month = askedDate.getMonth();
	let months = [];
	let startYear = start.getFullYear();
	let startMonth = start.getMonth();
	// Keep going till we run out of months or we cross the month we want
	while (n > 0 && (startYear < year || (startYear === year && startMonth <= month))) {
		startMonth += 1;
		if (startMonth === 12) {
			startMonth = 0;
			startYear += 1;
		}
		n -= 1;
	}
	if (n >= 0) {
		months.push([year, month + 1]);
	}
	return months;
}

export function getMonthId(year: number, month: number) {
	return year + '-' + (month + '').padStart(2, '0');
}

export function getMonthIDs(date: Date, last_n: number) {
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let months = [];
	while (last_n > 0) {
		months.push(getMonthId(year, month));
		month -= 1;
		if (month === 0) {
			month = 12;
			year -= 1;
		}
		last_n -= 1;
	}
	return months;
}
