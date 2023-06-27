import { describe, expect, test } from '@jest/globals';
import functions from 'firebase-functions-test';
import { getOrInitializeFirebaseAdmin } from '../../../shared/src/firebase/app';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import { BankBalance, BANK_BALANCE_FIRESTORE_PATH, getIdFromBankBalance } from '../../../shared/src/types';
import { PostFinanceImporter } from './PostFinanceImporter';

describe('importPostfinanceBalance', () => {
	const projectId = 'test' + new Date().getTime();
	const testEnv = functions({ projectId: projectId });
	const firestoreAdmin = new FirestoreAdmin(getOrInitializeFirebaseAdmin({ projectId: projectId }));
	const postfinanceImporter = new PostFinanceImporter({ firestoreAdmin });

	beforeEach(async () => {
		await testEnv.firestore.clearFirestoreData({ projectId: projectId });
	});

	test('extract data correctly', () => {
		const testMail =
			'<table class=3D"body white" data-made-with-foundation=3D"" style=\n' +
			'=3D"border-spacing:0;border-collapse:collapse;padding:0;vertical-align:top;=\n' +
			'text-align:left;background:#ffffff;width:100%;color:#0a0a0a;font-family:Fru=\n' +
			'tiger, Helvetica, Arial, sans-serif;font-weight:normal;margin:0;Margin:0;li=\n' +
			'ne-height:19px;font-size:14px;"><tbody><tr style=3D"padding:0;vertical-alig=\n' +
			'n:top;text-align:left;"><td class=3D"center" align=3D"center" valign=3D"top=\n' +
			'" style=3D"word-wrap:break-word;-webkit-hyphens:auto;-moz-hyphens:auto;hyph=\n' +
			'ens:auto;border-collapse:collapse !important;padding:0;vertical-align:top;t=\n' +
			'ext-align:left;color:#0a0a0a;font-family:Frutiger, Helvetica, Arial, sans-s=\n' +
			'erif;font-weight:normal;margin:0;Margin:0;line-height:19px;font-size:14px;"=\n' +
			'><center style=3D"width:100%;"><!--[if !mso]><!--><table class=3D"container=\n' +
			'" align=3D"center" bgcolor=3D"#ffffff" cellpadding=3D"0" cellspacing=3D"0" =\n' +
			'style=3D"border-spacing:0;border-collapse:collapse;padding:0;vertical-align=\n' +
			':top;text-align:inherit;background:#fefefe;margin:0 auto;Margin:0 auto;max-=\n' +
			'width:580px;"><!--<![endif]--><!--[if mso]><table class=3D"container" align=\n' +
			'=3D"center" bgcolor=3D"#ffffff" cellpadding=3D"0" cellspacing=3D"0" width=\n' +
			'=3D"600"><![endif]--><tbody><tr style=3D"padding:0;vertical-align:top;text-=\n' +
			'align:left;"><td style=3D"word-wrap:break-word;-webkit-hyphens:auto;-moz-hy=\n' +
			'phens:auto;hyphens:auto;border-collapse:collapse !important;padding:0;verti=\n' +
			'cal-align:top;text-align:left;color:#0a0a0a;font-family:Frutiger, Helvetica=\n' +
			', Arial, sans-serif;font-weight:normal;margin:0;Margin:0;line-height:19px;f=\n' +
			'ont-size:14px;"><div class=3D"logo"><img alt=3D"PostFinance AG" src=3D"http=\n' +
			's://www.post.ch/static/Notifica//postfinance/postfinance-logo.png" style=3D=\n' +
			'"outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;width:100=\n' +
			'%;max-width:100%;clear:both;display:block;" /></div></td></tr><tr style=3D"=\n' +
			'padding:0;vertical-align:top;text-align:left;"><td class=3D"first last colu=\n' +
			'mns padded" style=3D"word-wrap:break-word;-webkit-hyphens:auto;-moz-hyphens=\n' +
			':auto;hyphens:auto;border-collapse:collapse !important;padding:8px;vertical=\n' +
			'-align:top;text-align:left;margin:0;Margin:0;padding-top:8px;padding-bottom=\n' +
			':8px;padding-left:8px;padding-right:8px;color:#0a0a0a;font-family:Frutiger,=\n' +
			' Helvetica, Arial, sans-serif;font-weight:normal;line-height:19px;font-size=\n' +
			':14px;"><br /><div>Dear Sir or Madam</div><br /><div>A credit of 80.00 has =\n' +
			"been booked to the account Contributions. Current balance: CHF 50'993=\n" +
			'97.53.</div><br /></td></tr><tr style=3D"padding:0;vertical-align:top;text-=\n' +
			'align:left;"><td class=3D"first last columns padded" style=3D"word-wrap:bre=\n' +
			'ak-word;-webkit-hyphens:auto;-moz-hyphens:auto;hyphens:auto;border-collapse=\n' +
			':collapse !important;padding:8px;vertical-align:top;text-align:left;margin:=\n' +
			'0;Margin:0;padding-top:8px;padding-bottom:8px;padding-left:8px;padding-righ=\n' +
			't:8px;color:#0a0a0a;font-family:Frutiger, Helvetica, Arial, sans-serif;font=\n' +
			'-weight:normal;line-height:19px;font-size:14px;"><br /><div>PostFinance</di=\n' +
			'v><br /><div>Do not reply to this automatically generated e-mail. Notificat=\n' +
			'ion settings can be modified in e-finance under =E2=80=9CSettings and profi=\n' +
			'le=E2=80=9D > =E2=80=9CNotifications=E2=80=9D.</div><br /></td></tr><tr sty=\n' +
			'le=3D"padding:0;vertical-align:top;text-align:left;"><td class=3D"first las=\n' +
			't columns padded secondary" style=3D"word-wrap:break-word;-webkit-hyphens:a=\n' +
			'uto;-moz-hyphens:auto;hyphens:auto;border-collapse:collapse !important;padd=\n' +
			'ing:8px;vertical-align:top;text-align:left;margin:0;Margin:0;padding-top:8p=\n' +
			'x;padding-bottom:8px;padding-left:8px;padding-right:8px;color:#0a0a0a;font-=\n' +
			'family:Frutiger, Helvetica, Arial, sans-serif;font-weight:normal;line-heigh=\n' +
			't:19px;font-size:smaller;background:#f5f1e8;"><div><strong>If you have any =\n' +
			'questions:</strong> 0848 888 710 (max. CHF 0.08/Min. in Switzerland)</div><=\n' +
			'div class=3D"right" style=3D"text-align:right;">Follow us on:<a href=3D"htt=\n' +
			'ps://www.postfinance.ch/socialmedia" style=3D"color:#2199e8;font-family:Fru=\n' +
			'tiger, Helvetica, Arial, sans-serif;font-weight:normal;padding:0;margin:0;M=\n' +
			'argin:0;text-align:left;line-height:1.3;text-decoration:none;"><img alt=3D"=\n' +
			'facebook" style=3D"outline:none;text-decoration:none;-ms-interpolation-mode=\n' +
			':bicubic;width:16px;max-width:100%;clear:both;display:inline;border:none;he=\n' +
			'ight:16px;" src=3D"https://www.post.ch/static/Notifica//postfinance/faceboo=\n' +
			'k.png" /></a>=C2=A0<a href=3D"https://www.postfinance.ch/socialmedia" style=\n' +
			'=3D"color:#2199e8;font-family:Frutiger, Helvetica, Arial, sans-serif;font-w=\n' +
			'eight:normal;padding:0;margin:0;Margin:0;text-align:left;line-height:1.3;te=\n' +
			'xt-decoration:none;"><img alt=3D"twitter" style=3D"outline:none;text-decora=\n' +
			'tion:none;-ms-interpolation-mode:bicubic;width:16px;max-width:100%;clear:bo=\n' +
			'th;display:inline;border:none;height:16px;" src=3D"https://www.post.ch/stat=\n' +
			'ic/Notifica//postfinance/twitter.png" /></a>=C2=A0<a href=3D"https://www.po=\n' +
			'stfinance.ch/socialmedia" style=3D"color:#2199e8;font-family:Frutiger, Helv=\n' +
			'etica, Arial, sans-serif;font-weight:normal;padding:0;margin:0;Margin:0;tex=\n' +
			't-align:left;line-height:1.3;text-decoration:none;"><img alt=3D"youtube" st=\n' +
			'yle=3D"outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;wid=\n' +
			'th:16px;max-width:100%;clear:both;display:inline;border:none;height:16px;" =\n' +
			'src=3D"https://www.post.ch/static/Notifica//postfinance/youtube.png" /></a>=\n' +
			'</div></td></tr></tbody></table></center></td></tr></tbody></table>';

		expect('contributions').toEqual(postfinanceImporter.extractAccount(testMail));
		expect(50).toEqual(postfinanceImporter.extractBalance(testMail));
	});

	test('inserts balances into firestore', async () => {
		const balances = [
			{
				timestamp: 1663339392,
				account: 'testAccount',
				balance: 1000,
				currency: 'CHF',
			} as BankBalance,
		];

		await postfinanceImporter.storeBalances(balances);

		const balance = balances[0];
		const snap = await firestoreAdmin
			.doc<BankBalance>(BANK_BALANCE_FIRESTORE_PATH, getIdFromBankBalance(balance))
			.get();
		expect(balance).toEqual(snap.data());
	});
	jest.setTimeout(30000);
});
