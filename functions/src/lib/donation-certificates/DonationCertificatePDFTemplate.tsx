// @ts-nocheck

// TODO: Use this basic working example to render PDF instead of pdfkit.
import ReactPDF, { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { User } from '../../../../../shared/src/types';
import { Translator } from '../../../../../shared/src/utils/i18n';

const styles = StyleSheet.create({
	page: {
		flexDirection: 'column',
		alignItems: 'flex-start',
	},
	row: {
		flexDirection: 'row',
	},
	section: {
		margin: 10,
		padding: 10,
		flexGrow: 1,
	},
});

interface DonationCertificatePDFTemplateProps {
	user: User;
	translator: Translator;
	year: number;
}

function DonationCertificatePDFTemplate({ user, translator }: DonationCertificatePDFTemplateProps) {
	const country = translator.t(user.address?.country as string, { namespace: 'countries' });
	const header = translator.t('header');
	const location = translator.t('location', { context: { date: new Date() } });

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.section}>
					<Text>{header}</Text>
				</View>
				<View style={styles.section}>
					<Text>{country}</Text>
					<Text>{location}</Text>
				</View>
			</Page>
		</Document>
	);
}

export const renderDonationCertificatePDFTemplate = async (user: User, year: number, path: string) => {
	const translator = await Translator.getInstance({
		language: user.language || 'de',
		namespaces: ['donation-certificate', 'countries'],
	});
	ReactPDF.render(<DonationCertificatePDFTemplate user={user} year={year} translator={translator} />, path);
};
