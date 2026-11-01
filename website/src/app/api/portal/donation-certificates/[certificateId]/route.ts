import { getSessionByType } from '@/modules/auth/session.service';
import { donationCertificateIdSchema } from '@/modules/donation-certificates/donation-certificate.schemas';
import { downloadDonationCertificateForUser } from '@/modules/donation-certificates/donation-certificate.service';

type RouteContext = {
	params: Promise<{ certificateId: string }>;
};

export const GET = async (_request: Request, { params }: RouteContext) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		const needsAuthentication = sessionResult.error === 'Not authenticated' || sessionResult.error === 'No user session';

		return Response.json(
			{ error: needsAuthentication ? 'Unauthorized' : 'Could not verify user session' },
			{ status: needsAuthentication ? 401 : 500 },
		);
	}

	const { certificateId } = await params;
	const parsedCertificateId = donationCertificateIdSchema.safeParse(certificateId);
	if (!parsedCertificateId.success) {
		return Response.json({ error: 'Donation certificate not found' }, { status: 404 });
	}

	const result = await downloadDonationCertificateForUser(sessionResult.data.id, parsedCertificateId.data);
	if (!result.success) {
		const isNotFound = result.error === 'Donation certificate not found';

		return Response.json(
			{ error: isNotFound ? 'Donation certificate not found' : 'Could not download donation certificate' },
			{ status: isNotFound ? 404 : 500 },
		);
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
