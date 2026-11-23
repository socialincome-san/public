// The first characters (code points, so 𠮷 stays whole) of the first two words, for AvatarFallback.
// Not in avatar.tsx, which is a client module
export const getInitials = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => Array.from(part)[0])
		.join('')
		.toUpperCase();
