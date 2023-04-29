import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField } from '@mui/material';
import { ChangeEvent, useState } from 'react';

export default function SearchBar({ onTextSearch }: { onTextSearch: (text: string) => void }) {
	const [searchTerm, setSearchTerm] = useState('');

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		onTextSearch(event.target.value);
	};

	return (
		<TextField
			type="search"
			label="Search"
			value={searchTerm}
			onChange={handleChange}
			sx={{ minWidth: 600 }}
			InputProps={{
				endAdornment: (
					<InputAdornment position="end">
						<SearchIcon />
					</InputAdornment>
				),
			}}
		/>
	);
}
