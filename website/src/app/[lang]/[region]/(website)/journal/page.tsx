export const revalidate = 3600; // Update once an hour

export default async function Page(props: { params: { lang: string } }) {
	const lang = props.params.lang;

	function getPublishedDateFormatted(date: string, lang: string) {
		const dateObject = new Date(date);
		const month = dateObject.toLocaleString(lang, { month: 'long' });
		return `${month} ${dateObject.getDate()}, ${dateObject.getFullYear()}`;
	}

	return <div className="blog w-full justify-center">OVERVIEW PAGE</div>;
}
