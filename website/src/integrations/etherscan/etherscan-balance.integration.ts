import { Currency } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';

const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';
const ETHEREUM_CHAIN_ID = '1';
const USDC_CONTRACT_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDC_DECIMALS = 1_000_000;
const WEI_PER_ETH = BigInt('1000000000000000000');

export type CustodianStablecoinWalletBalance = {
	address: string;
	amount: number;
	currency: Currency;
};

export const fetchCustodianStablecoinWalletBalances = async (
	addresses: string[],
): Promise<ServiceResult<CustodianStablecoinWalletBalance[]>> => {
	if (addresses.length === 0) {
		return resultOk([]);
	}

	const apiKey = process.env.ETHERSCAN_API_KEY?.trim();
	if (!apiKey) {
		return resultFail('Etherscan API key is not configured');
	}

	try {
		const walletBalances = await Promise.all(
			addresses.map(async (address) => {
				const [ethResult, usdcResult] = await Promise.all([
					fetchBalance(
						new URLSearchParams({
							module: 'account',
							action: 'balance',
							apikey: apiKey,
							chainid: ETHEREUM_CHAIN_ID,
							address,
						}),
						'ETH',
					),
					fetchBalance(
						new URLSearchParams({
							module: 'account',
							action: 'tokenbalance',
							chainid: ETHEREUM_CHAIN_ID,
							contractaddress: USDC_CONTRACT_ADDRESS,
							address,
							tag: 'latest',
							apikey: apiKey,
						}),
						'USDC',
					),
				]);
				if (!ethResult.success) {
					return ethResult;
				}
				if (!usdcResult.success) {
					return usdcResult;
				}

				const ethAmount = Number(weiToEth(ethResult.data));
				const usdcAmount = Number(usdcResult.data) / USDC_DECIMALS;
				if (!Number.isFinite(ethAmount) || !Number.isFinite(usdcAmount)) {
					return resultFail(`Invalid Etherscan balance amount for wallet ${address}`);
				}

				return resultOk([
					{ address, amount: ethAmount, currency: Currency.ETH },
					{ address, amount: usdcAmount, currency: Currency.USD },
				]);
			}),
		);
		const balances: CustodianStablecoinWalletBalance[] = [];
		for (const walletResult of walletBalances) {
			if (!walletResult.success) {
				return walletResult;
			}
			balances.push(...walletResult.data);
		}

		return resultOk(balances);
	} catch (error) {
		console.error('Could not get custodian stablecoin wallet balances', { error });

		return resultFail('Could not get custodian stablecoin wallet balances');
	}
};

const fetchBalance = async (parameters: URLSearchParams, asset: 'ETH' | 'USDC'): Promise<ServiceResult<string>> => {
	try {
		const response = await fetch(`${ETHERSCAN_API_URL}?${parameters.toString()}`, { method: 'GET' });
		if (!response.ok) {
			return resultFail(`Etherscan ${asset} balance request failed: ${response.status} ${response.statusText}`);
		}

		const data: unknown = await response.json();
		if (!isEtherscanBalanceResponse(data)) {
			return resultFail(`Invalid Etherscan ${asset} balance response`);
		}
		if (data.status !== '1' || !/^\d+$/.test(data.result)) {
			return resultFail(`Invalid Etherscan ${asset} balance response: ${data.message}`);
		}

		return resultOk(data.result);
	} catch (error) {
		console.error(`Could not get Etherscan ${asset} balance`, { error });

		return resultFail(`Could not get Etherscan ${asset} balance`);
	}
};

const isEtherscanBalanceResponse = (value: unknown): value is EtherscanBalanceResponse =>
	typeof value === 'object' &&
	value !== null &&
	'status' in value &&
	typeof value.status === 'string' &&
	'message' in value &&
	typeof value.message === 'string' &&
	'result' in value &&
	typeof value.result === 'string';

const weiToEth = (wei: string): string => {
	const value = BigInt(wei);
	const whole = value / WEI_PER_ETH;
	const fraction = (value % WEI_PER_ETH).toString().padStart(18, '0').replace(/0+$/, '');

	return fraction.length === 0 ? whole.toString() : `${whole}.${fraction}`;
};

type EtherscanBalanceResponse = {
	status: string;
	message: string;
	result: string;
};
