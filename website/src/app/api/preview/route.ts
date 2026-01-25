import { cookies, draftMode } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

const ALLOWED_SLUGS_PREFIXES = ['journal', 'author', 'tag', 'new-website'];
const DEFAULT_LANGUAGE = 'en';
const ALLOWED_LANGUAGES = ['en', 'it', 'fr', 'de'];
const DRAFT_MODE_COOKIE_NAME = '__prerender_bypass';
const JOURNAL = 'journal';
const DEFAULT_REGION = 'int';

function getLanguage(slug: string | null) {
	if (slug) {
		for (let lang of ALLOWED_LANGUAGES) {
			if (slug.toLowerCase().startsWith(lang.toLowerCase())) return lang;
		}
	}
	return DEFAULT_LANGUAGE;
}

function validateSecret(secret: string | null) {
	return process.env.STORYBLOK_PREVIEW_SECRET && secret === process.env.STORYBLOK_PREVIEW_SECRET;
}

function validateSlug(slug: string | undefined | null) {
	return slug && ALLOWED_SLUGS_PREFIXES.some((value) => slug.toLowerCase().startsWith(value.toLowerCase()));
}

function removeLanguagePrefix(slug: string | null, language: string) {
	if (!slug) return slug;
	const lowerSlug = slug.toLowerCase();
	const lowerLang = language.toLowerCase();
	if (lowerSlug === lowerLang || lowerSlug.startsWith(`${lowerLang}/`)) {
		return slug.replace(new RegExp(`^${language}(/|$)`, 'i'), '');
	}
	return slug;
}

async function enableDraftModeAndAdaptCookie() {
	(await draftMode()).enable();

	const draft = (await cookies()).get(DRAFT_MODE_COOKIE_NAME);
	const draftValue = draft?.value;
	if (draftValue) {
		(await cookies()).set({
			name: DRAFT_MODE_COOKIE_NAME,
			value: draftValue,
			httpOnly: true,
			path: '/',
			secure: true,
			sameSite: 'none',
		});
	}
}

/**
 *
 * @param request
 * @constructor
 *
 * The Storyblok integration needs a way to display non-cached pages during the designing of an article from the Storyblok
 * GUI. Therefore, we enable the preview-mode by setting the Draft Mode cookie according to the official NextJS guidelines.
 */
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const secret = searchParams.get('secret');
	const lang = getLanguage(searchParams.get('slug'));
	const slug = removeLanguagePrefix(searchParams.get('slug'), lang);

	if (!validateSlug(slug)) {
		return new Response('Invalid slug', { status: 400 });
	}

	if (!validateSecret(secret)) {
		return new Response('Invalid token', { status: 401 });
	}
	await enableDraftModeAndAdaptCookie();
	const path = ALLOWED_SLUGS_PREFIXES.some((prefix) => slug!.toLowerCase().startsWith(prefix))
		? slug
		: `${JOURNAL}/${slug}`;
	redirect(`/${lang}/${DEFAULT_REGION}/${path}`, RedirectType.push);
}
