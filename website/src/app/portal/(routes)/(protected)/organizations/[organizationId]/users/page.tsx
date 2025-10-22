type Props = { params: Promise<{ organizationId: string }> };

export default async function UsersPageOrganizationScoped({ params }: Props) {
	return (
		<p className="text-gradient animate-pulse bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-2xl font-semibold text-transparent">
			🚀 Coming Soon!
		</p>
	);
}
