import { Currency } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { type CustodianStablecoinWalletBalance } from './custodian-stablecoin-wallet.types';

const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';
const ETHEREUM_CHAIN_ID = '1';
const USDC_CONTRACT_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDC_DECIMALS = 1_000_000;
const WEI_PER_ETH = BigInt('1000000000000000000');

type EtherscanBalanceResponse = {
	status: string;
	message: string;
	result: string;
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

export class CustodianStablecoinWalletService extends BaseService {
	async getLatestBalances(addresses: string[]): Promise<ServiceResult<CustodianStablecoinWalletBalance[]>> {
		if (addresses.length === 0) {
			return this.resultOk([]);
		}

		const apiKey = process.env.ETHERSCAN_API_KEY?.trim();
		if (!apiKey) {
			return this.resultFail('Etherscan API key is not configured');
		}

		try {
			const walletBalances = await Promise.all(
				addresses.map(async (address) => {
					const [ethResult, usdcResult] = await Promise.all([
						this.fetchBalance(
							new URLSearchParams({
								module: 'account',
								action: 'balance',
								apikey: apiKey,
								chainid: ETHEREUM_CHAIN_ID,
								address,
							}),
							'ETH',
						),
						this.fetchBalance(
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

					const ethAmount = Number(weiToEth(ethResult));
					const usdcAmount = Number(usdcResult) / USDC_DECIMALS;
					if (!Number.isFinite(ethAmount) || !Number.isFinite(usdcAmount)) {
						throw new Error(`Invalid Etherscan balance amount for wallet ${address}`);
					}

					return [
						{ address, amount: ethAmount, currency: Currency.ETH },
						{ address, amount: usdcAmount, currency: Currency.USD },
					];
				}),
			);

			return this.resultOk(walletBalances.flat());
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not get custodian stablecoin wallet balances: ${JSON.stringify(error)}`);
		}
	}

	private async fetchBalance(parameters: URLSearchParams, asset: 'ETH' | 'USDC'): Promise<string> {
		const response = await fetch(`${ETHERSCAN_API_URL}?${parameters.toString()}`, { method: 'GET' });
		if (!response.ok) {
			throw new Error(`Etherscan ${asset} balance request failed: ${response.status} ${response.statusText}`);
		}

		const data: unknown = await response.json();
		if (!isEtherscanBalanceResponse(data)) {
			throw new Error(`Invalid Etherscan ${asset} balance response: invalid response shape`);
		}
		if (data.status !== '1' || !/^\d+$/.test(data.result)) {
			throw new Error(`Invalid Etherscan ${asset} balance response: ${data.message}`);
		}

		return data.result;
	}
}
