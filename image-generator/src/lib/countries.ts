// Folders in src/style-references. Global scenes have their own set: the West African scenes would pull them toward West Africa.
type StyleReferenceSet = 'west-africa' | 'global';

// Typical local details keep scenes from collapsing into a generic "West Africa".
// Draft from general knowledge; still to be checked by people who know these countries.
export const COUNTRIES = [
	{
		value: 'sierra-leone',
		label: 'Sierra Leone',
		styleReferences: 'west-africa',
		setting:
			'Unless the subject says otherwise, the scene takes place in Sierra Leone and the people are Sierra Leonean. Where it fits the moment, use two or three typical local details: an okada motorbike taxi, a keke tricycle taxi or a poda-poda minibus, gara tie-dye cloth in indigo, a lappa wrap skirt with a matching head tie, a seller carrying a tray of groundnuts on her head, concrete-block houses with corrugated zinc roofs on a green hillside.',
	},
	{
		value: 'liberia',
		label: 'Liberia',
		styleReferences: 'west-africa',
		setting:
			'Unless the subject says otherwise, the scene takes place in Liberia and the people are Liberian. Where it fits the moment, use two or three typical local details: a keke tricycle taxi or a pen-pen motorbike taxi, a yellow Monrovia taxi, a lappa suit in African print, handwoven striped country cloth, a seller with kala or cold water in small plastic sachets, concrete houses with zinc roofs and front porches.',
	},
	{
		value: 'ghana',
		label: 'Ghana',
		styleReferences: 'west-africa',
		setting:
			'Unless the subject says otherwise, the scene takes place in Ghana and the people are Ghanaian. Where it fits the moment, use two or three typical local details: a tro-tro minibus, a taxi with yellow-painted fenders, a wax-print kaba and slit, a seller with kelewele or coconuts on a cart, a painted container shop.',
	},
	{
		value: 'global',
		label: 'Global',
		styleReferences: 'global',
		setting:
			'Unless the subject says otherwise, the scene takes place in an ordinary modern city or town anywhere in the world, and the people have light skin. They look like ordinary people you would pass in the street, not models: plain, everyday faces with irregular features, unstyled hair, varied ages and body shapes, no chiseled jaw, no perfectly groomed beard, no glamorous or fashion-shoot look. Paint the skin in an even, natural tone with no rosy or red cheeks, no blush and no red nose. Keep the setting generic, with no country-specific landmarks, flags or signs. Where it fits the moment, use one or two everyday details: a tram, bus or train in the distance, a park bench, a café table, a simple doorway, a canvas tote bag. Dress people for the moment and vary it: a hoodie, a knit jumper, a rain jacket, a denim or work jacket, a T-shirt, a cardigan, a fleece. No scarf and no long cream or beige coat unless the subject asks for one. Choose the mustard yellow item from what fits the scene, such as a backpack, an umbrella, a beanie, a mug, a bicycle, flowers, a jumper or a shopping bag.',
	},
] satisfies { value: string; label: string; styleReferences: StyleReferenceSet; setting: string }[];

export const DEFAULT_COUNTRY = COUNTRIES[0];

export type Country = (typeof COUNTRIES)[number];
