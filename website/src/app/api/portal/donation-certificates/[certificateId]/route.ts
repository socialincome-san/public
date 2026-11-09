import { downloadDonationCertificateForUser } from '@/modules/donation-certificates/donation-certificate.service';
import { requireSession } from '@/server/session';

type RouteContext = {
	params: Promise<{ certificateId: string }>;
};

export const GET = async (_request: Request, { params }: RouteContext) => {
	const user = await requireSession('user');
	const { certificateId } = await params;

	const result = await downloadDonationCertificateForUser(user.id, certificateId);
	if (!result.success) {
		return Response.json({ error: result.error }, { status: result.status ?? 500 });
	}

	return new Response(new Uint8Array(result.data.contents), {
		headers: {
			'Cache-Control': 'private, no-store',
			'Content-Disposition': `inline; filename="${result.data.filename}"`,
			'Content-Type': 'application/pdf',
			'X-Content-Type-Options': 'nosniff',
		},
	});
};
