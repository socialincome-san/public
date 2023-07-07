import _ from 'lodash';

export const groupByAndSort = <T>(
	collection: _.Collection<T>,
	groupAttribute: string,
	aggregation: (group: T[]) => number,
	aggregationName: string,
) => {
	return collection
		.groupBy(groupAttribute)
		.map((contributions, group) => ({
			[groupAttribute]: group,
			[aggregationName]: aggregation(contributions),
		}))
		.sortBy((x) => x[groupAttribute])
		.value();
};

export const cumulativeSum = <T>(collection: T[], valueAttribute: string): T[] => {
	const builder = (acc: T[], element: T) => {
		type ObjectKey = keyof typeof element;
		const key = valueAttribute as ObjectKey;

		const previousValue = acc.length > 0 ? (acc[acc.length - 1][key] as number) : 0;
		const incrementedValue = previousValue + (element[key] as number);
		// @ts-ignore
		const { [valueAttribute]: _, ...oldElement } = element;

		const newElement = { ...oldElement, [valueAttribute]: incrementedValue } as T;
		acc.push(newElement);
		return acc;
	};
	return _.reduce(collection, builder, []);
};

export interface StatsEntry {
	[p: string]: string | number;
}
