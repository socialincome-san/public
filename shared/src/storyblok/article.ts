export interface StoryBlokImage {
	alt: string;
	filename: string;
}

export interface StoryBlokTopic {
	slug: string;
	content: {
		value: string;
	};
}

export interface StoryBlokAuthor {
	content: {
		avatar: StoryBlokImage;
		fullName: string;
	};
}

export interface StoryBlokArticle {
	title: string;
	content: any;
	subtitle: string;
	image: StoryBlokImage;
	topics: StoryBlokTopic[];
	author: StoryBlokAuthor;
}
