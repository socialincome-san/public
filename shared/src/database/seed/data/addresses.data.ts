import { Address } from '@prisma/client';

export const addressesData: Address[] = [
	{
		id: 'address-1',
		street: 'Bahnhofstrasse',
		number: '10',
		city: 'Zürich',
		zip: '8001',
		country: 'Switzerland',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'address-2',
		street: 'Rue du Rhône',
		number: '45',
		city: 'Genève',
		zip: '1204',
		country: 'Switzerland',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'address-3',
		street: 'Marktgasse',
		number: '7',
		city: 'Bern',
		zip: '3011',
		country: 'Switzerland',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'address-4',
		street: 'Kissy Road',
		number: '12',
		city: 'Freetown',
		zip: '1000',
		country: 'Sierra Leone',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'address-5',
		street: 'Bo-Town Highway',
		number: '22',
		city: 'Bo',
		zip: '2002',
		country: 'Sierra Leone',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'address-6',
		street: 'Koidu Road',
		number: '5',
		city: 'Kenema',
		zip: '3003',
		country: 'Sierra Leone',
		createdAt: new Date(),
		updatedAt: null
	}
];