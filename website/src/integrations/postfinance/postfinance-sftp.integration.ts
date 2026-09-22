import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import SFTPClient from 'ssh2-sftp-client';
import { z } from 'zod';

export type PostFinanceReport = {
	name: string;
	contents: Buffer;
};

const postFinanceSftpConfigSchema = z.object({
	host: z.string().min(1),
	port: z.coerce.number().int().positive(),
	username: z.string().min(1),
	privateKeyBase64: z.string().min(1),
});

export const listPostFinanceReportFileNames = async (): Promise<ServiceResult<string[]>> => {
	const configResult = getPostFinanceSftpConfig();
	if (!configResult.success) {
		return configResult;
	}

	const client = new SFTPClient();
	try {
		await client.connect(toConnectionOptions(configResult.data));
		const files = await client.list('/yellow-net-reports');

		return resultOk(files.map(({ name }) => name));
	} catch (error) {
		console.error('Could not list PostFinance reports', { error });

		return resultFail('Could not list PostFinance reports');
	} finally {
		await endConnection(client);
	}
};

export const downloadPostFinanceReports = async (fileNames: string[]): Promise<ServiceResult<PostFinanceReport[]>> => {
	if (fileNames.length === 0) {
		return resultOk([]);
	}

	const configResult = getPostFinanceSftpConfig();
	if (!configResult.success) {
		return configResult;
	}

	const client = new SFTPClient();
	try {
		await client.connect(toConnectionOptions(configResult.data));
		const reports: PostFinanceReport[] = [];
		for (const name of fileNames) {
			const contents = await client.get(`/yellow-net-reports/${name}`);
			if (!Buffer.isBuffer(contents)) {
				console.error('PostFinance report download returned unexpected content', { name });

				return resultFail('Could not download PostFinance reports');
			}
			reports.push({ name, contents });
		}

		return resultOk(reports);
	} catch (error) {
		console.error('Could not download PostFinance reports', { error });

		return resultFail('Could not download PostFinance reports');
	} finally {
		await endConnection(client);
	}
};

const getPostFinanceSftpConfig = (): ServiceResult<{
	host: string;
	port: number;
	username: string;
	privateKeyBase64: string;
}> => {
	const parsedConfig = postFinanceSftpConfigSchema.safeParse({
		host: process.env.POSTFINANCE_FTP_HOST,
		port: process.env.POSTFINANCE_FTP_PORT,
		username: process.env.POSTFINANCE_FTP_USER,
		privateKeyBase64: process.env.POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64,
	});
	if (!parsedConfig.success) {
		console.error('PostFinance SFTP configuration is missing or invalid');

		return resultFail('PostFinance SFTP is not configured');
	}

	return resultOk(parsedConfig.data);
};

const toConnectionOptions = (config: {
	host: string;
	port: number;
	username: string;
	privateKeyBase64: string;
}): {
	host: string;
	port: number;
	username: string;
	privateKey: string;
} => ({
	host: config.host,
	port: config.port,
	username: config.username,
	privateKey: Buffer.from(config.privateKeyBase64, 'base64').toString('utf8'),
});

const endConnection = async (client: SFTPClient): Promise<void> => {
	try {
		await client.end();
	} catch (error) {
		console.warn('Could not close PostFinance SFTP connection', { error });
	}
};
