import _ from 'lodash';

export const capitalizeStringIfUppercase = (value: string) => {
	if (value.toUpperCase() === value) {
		return _.upperFirst(value);
	} else {
		return value;
	}
};
