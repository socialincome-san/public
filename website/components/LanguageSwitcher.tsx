import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import React, { Fragment } from 'react';
import { useCookies } from 'react-cookie';

export default function LanguageSwitcher(props: LanguageSwitcherProps) {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const [cookie, setCookie] = useCookies(['NEXT_LOCALE']);
	const router = useRouter();
	const { pathname, asPath, query, locale } = router;

	const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLanguageSwitch = (isoCode: string) => {
		setAnchorEl(null);
		// this overrides the automatic language selection based on the browser settings
		// when someone explicitly sets the language
		if (cookie.NEXT_LOCALE !== isoCode) {
			setCookie('NEXT_LOCALE', isoCode, { path: '/' });
		}
		if (locale !== isoCode) {
			router.push({ pathname, query }, asPath, { locale: isoCode });
		}
	};

	return (
		<Fragment>
			<Button
				id="current-language"
				aria-controls={open ? 'language-chooser' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleMenuOpen}
				variant="outlined"
				endIcon={<KeyboardArrowDownIcon />}
			>
				{locale
					? props.languages[locale]
						? props.languages[locale]
						: props.languages[props.fallbackIsoCode]
					: props.languages[props.fallbackIsoCode]}
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
				{Object.entries(props.languages).map(([isoCode, name]) => (
					<MenuItem
						key={isoCode}
						value={isoCode}
						selected={isoCode === locale}
						onClick={() => handleLanguageSwitch(isoCode)}
					>
						{name as string}
					</MenuItem>
				))}
			</Menu>
		</Fragment>
	);
}

interface LanguageSwitcherProps {
	languages: any;
	fallbackIsoCode: string;
}
