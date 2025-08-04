import { NextResponse } from 'next/server';
import { getNewsletterHTML } from '@/lib/newsletter'; // Adjust the import path to where your file is

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
	const { slug } = params;

	const html = getNewsletterHTML(slug);
	if (!html) {
		return new NextResponse('Newsletter not found', { status: 404 });
	}

	return new NextResponse(html, {
		status: 200,
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'no-store',
		},
	});
}