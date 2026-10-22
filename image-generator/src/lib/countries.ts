// Typical local details keep scenes from collapsing into a generic "West Africa".
// Draft from general knowledge; still to be checked by people who know these countries.
export const COUNTRIES = [
	{
		value: 'sierra-leone',
		label: 'Sierra Leone',
		setting:
			'Unless the subject says otherwise, the scene takes place in Sierra Leone and the people are Sierra Leonean. Where it fits the moment, use two or three typical local details: an okada motorbike taxi, a keke tricycle taxi or a poda-poda minibus, gara tie-dye cloth in indigo, a lappa wrap skirt with a matching head tie, a seller carrying a tray of groundnuts on her head, concrete-block houses with corrugated zinc roofs on a green hillside.',
	},
	{
		value: 'liberia',
		label: 'Liberia',
		setting:
			'Unless the subject says otherwise, the scene takes place in Liberia and the people are Liberian. Where it fits the moment, use two or three typical local details: a keke tricycle taxi or a pen-pen motorbike taxi, a yellow Monrovia taxi, a lappa suit in African print, handwoven striped country cloth, a seller with kala or cold water in small plastic sachets, concrete houses with zinc roofs and front porches.',
	},
	{
		value: 'ghana',
		label: 'Ghana',
		setting:
			'Unless the subject says otherwise, the scene takes place in Ghana and the people are Ghanaian. Where it fits the moment, use two or three typical local details: a tro-tro minibus, a taxi with yellow-painted fenders, a wax-print kaba and slit, a seller with kelewele or coconuts on a cart, a painted container shop.',
	},
	{
		value: 'switzerland',
		label: 'Switzerland',
		setting:
			'Unless the subject says otherwise, the scene takes place in Switzerland and the people are Swiss. Where it fits the moment, use one or two typical local details: a tram or train in the distance, a simple tram stop or bench, a lakeside path, a wool coat and scarf, a canvas tote bag.',
	},
] satisfies { value: string; label: string; setting: string }[];

export const DEFAULT_COUNTRY = COUNTRIES[0];
