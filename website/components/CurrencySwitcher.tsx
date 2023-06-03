import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import React, { Fragment } from 'react';

export default function CurrencySwitcher(props: CurrencySwitcherProps) {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const router = useRouter();
	const { pathname, asPath, query, locale } = router;

	const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleCurrencySwitch = (currency: string) => {
		setAnchorEl(null);
		const path = asPath.split('/');
		path.pop();
		path.push(currency.toLowerCase());
		if (currency !== props.currentCurrency) {
			router.push({ pathname, query }, path.join('/'), { locale: locale });
		}
	};

	return (
		<Fragment>
			<Button
				id="current-currency"
				aria-controls={open ? 'currency-chooser' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleMenuOpen}
				variant="outlined"
				endIcon={<KeyboardArrowDownIcon />}
			>
				{props.currentCurrency}
			</Button>
			<Menu
				id="language-chooser"
				anchorEl={anchorEl}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'current-language',
				}}
				open={open}
			>
				{props.supportedCurrencies.map((currency) => (
					<MenuItem
						key={currency}
						value={currency}
						selected={currency === props.currentCurrency}
						onClick={() => handleCurrencySwitch(currency)}
					>
						{currency}
					</MenuItem>
				))}
			</Menu>
		</Fragment>
	);
}

interface CurrencySwitcherProps {
	currentCurrency: string;
	supportedCurrencies: string[];
}
