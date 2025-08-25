'use client';

import { Avatar, AvatarFallback } from '@/app/portal/components/avatar';
import { Separator } from '@/app/portal/components/breadcrumb/separator';
import { Button } from '@/app/portal/components/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/app/portal/components/dropdown-menu';
import { Logo } from '@/app/portal/components/logo';
import { Building2, ChevronsUpDown, Handshake, LogOut, Menu, Settings, UsersRound, WalletCards, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname();

	const navLinks = [
		{ href: '/portal/programs', label: 'Programs', hasDropdown: true },
		{ href: '/portal/monitoring/payout-confirmation', label: 'Monitoring', hasDropdown: false },
		{ href: '/portal/management/recipients', label: 'Management', hasDropdown: false },
		{ href: '/portal/delivery/make-payouts', label: 'Delivery', hasDropdown: false },
	];

	const adminLinks = [
		{ href: '/portal/admin/organizations', label: 'Organizations', icon: Building2 },
		{ href: '/portal/admin/users', label: 'Users', icon: UsersRound },
		{ href: '/portal/admin/local-partners', label: 'Local partners', icon: Handshake },
		{ href: '/portal/admin/expenses', label: 'Expenses', icon: WalletCards },
		{ href: '/portal/account/settings', label: 'Account settings', icon: Settings },
	];

	const toggleMenu = () => setIsMenuOpen((v) => !v);
	const isActiveLink = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

	const MobileTopBar = () => (
		<div className={`flex h-14 items-center justify-between px-4 ${!isMenuOpen ? 'border-border border-b' : ''}`}>
			{/* Mobile menu toggle button */}
			<Button
				variant="ghost"
				onClick={toggleMenu}
				className="relative -ml-2 flex h-9 w-9 items-center justify-center [&_svg]:size-5"
			>
				<span
					className={`absolute transition-all duration-300 ${isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
				>
					<Menu />
				</span>
				<span
					className={`absolute transition-all duration-300 ${isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}
				>
					<X />
				</span>
			</Button>

			{/* Logo */}
			<Logo className="absolute left-1/2 -translate-x-1/2 transform" />
		</div>
	);

	const ProfileName = () => (
		<>
			<Avatar>
				<AvatarFallback className="bg-primary text-background">LS</AvatarFallback>
			</Avatar>
			<div className="text-left">
				<p className="text-foreground text-sm font-medium md:text-xs">Lea Strohm </p>
				<p className="text-muted-foreground text-xs">Social Income</p>
			</div>
		</>
	);

	// Navigation items component
	const NavItems = ({ isMobile = false }) => {
		const linkClasses = `relative rounded-md font-medium ${isMobile ? 'text-base' : 'text-lg'} ${
			isMobile ? 'text-primary' : 'text-primary hover:bg-accent'
		} px-3 py-2`;

		return (
			<nav>
				{/* Main navigation links */}
				{navLinks.map((link) => {
					const active = isActiveLink(link.href);
					return (
						<Link key={link.label} href={link.href} className={linkClasses}>
							{active && <span className="bg-primary absolute -top-7 left-0 h-1 w-full rounded-b-lg" />}
							{link.label}
						</Link>
					);
				})}
			</nav>
		);
	};

	return (
		<>
			{/* Desktop Navbar */}
			<nav className="container hidden h-16 items-center justify-between md:h-24 lg:block">
				<div className="flex h-full items-center justify-between">
					{/* Left section: Logo */}

					<Logo />

					{/* Right section: user menu and button */}
					<div className="flex items-center gap-x-4">
						<NavItems />
					</div>

					{/* User menu dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="flex h-12 items-center gap-2 rounded-full px-3 py-2 pl-2.5">
								<ProfileName />
								<ChevronsUpDown className="text-accent-foreground h-4 w-4 opacity-50" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-64">
							{adminLinks.map(({ href, label, icon: Icon }) => (
								<DropdownMenuItem asChild key={href}>
									<Link href={href} className="flex items-center gap-2">
										<Icon className="h-4 w-4" />
										<span>{label}</span>
									</Link>
								</DropdownMenuItem>
							))}

							<DropdownMenuSeparator />

							<DropdownMenuItem
								onSelect={(e) => {
									e.preventDefault();
									// TODO: sign-out logic
								}}
								className="text-destructive focus:text-destructive"
							>
								<LogOut className="mr-2 h-4 w-4" />
								<span>Sign out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</nav>

			{/* Mobile Navbar */}
			<nav className="mb-4 lg:hidden">
				<MobileTopBar />
			</nav>

			{/* Mobile Menu Overlay */}
			{isMenuOpen && (
				<div className="border-border border-b lg:hidden">
					<div className="flex flex-col">
						{/* Mobile menu content */}
						<div className="flex-grow overflow-y-auto p-2">
							<div className="flex flex-col">
								<NavItems isMobile />
							</div>
						</div>
						<Separator />
						{/* Mobile user profile section */}
						<div className="p-2">
							{/* User info */}
							<div className="flex items-center space-x-3 p-2">
								<ProfileName />
							</div>
							{/* User-related links */}
							<div className="grid gap-1 p-2">
								{adminLinks.map(({ href, label }) => (
									<Link key={href} href={href} className="text-muted-foreground rounded-md px-2 py-2 font-medium">
										{label}
									</Link>
								))}
								<button
									onClick={() => {
										// TODO: sign-out logic
									}}
									className="text-destructive rounded-md px-2 py-2 text-left font-medium"
								>
									Sign out
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
