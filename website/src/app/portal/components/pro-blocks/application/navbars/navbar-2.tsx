'use client';

import { Logo } from '@/app/portal/components/pro-blocks/logo';
import { Avatar, AvatarFallback } from '@/app/portal/components/ui/avatar';
import { Button } from '@/app/portal/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/app/portal/components/ui/dropdown-menu';
import { Separator } from '@/app/portal/components/ui/separator';
import { ChevronsUpDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function Navbar2() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navLinks = [
		{ href: '#', label: 'Programs', hasDropdown: true, active: true },
		{ href: '#', label: 'Monitoring', hasDropdown: false, active: false },
		{ href: '#', label: 'Management', hasDropdown: false, active: false },
		{ href: '#', label: 'Delivery', hasDropdown: false, active: false },
	];

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	// Mobile top bar component
	const MobileTopBar = () => (
		<div className={`flex h-14 items-center justify-between px-4 ${!isMenuOpen ? 'border-border border-b' : ''}`}>
			{/* Mobile menu toggle button */}
			<Button
				variant="ghost"
				onClick={toggleMenu}
				className="relative -ml-2 flex h-9 w-9 items-center justify-center [&_svg]:size-5"
			>
				<span
					className={`absolute transition-all duration-300 ${
						isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
					}`}
				>
					<Menu />
				</span>
				<span
					className={`absolute transition-all duration-300 ${
						isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
					}`}
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
				{navLinks.map((link) => (
					<Link key={link.label} href={link.href} className={`${linkClasses}`}>
						{link.active && <span className="bg-primary absolute -top-7 left-0 h-1 w-full rounded-b-lg"></span>}
						{link.label}
					</Link>
				))}
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
							<Button
								variant="outline"
								className="border-input bg-background/5 flex h-12 items-center gap-2 rounded-full border px-3 py-2 pl-2.5"
							>
								<ProfileName />
								<ChevronsUpDown className="text-accent-foreground h-4 w-4 opacity-50" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Profile</DropdownMenuItem>
							<DropdownMenuItem>Settings</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Logout</DropdownMenuItem>
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
								<NavItems isMobile={true} />
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
							<div>
								<Link href="#" className="text-muted-foreground block rounded-md px-2 py-2 font-medium">
									My profile
								</Link>
								<Link href="#" className="text-muted-foreground block rounded-md px-2 py-2 font-medium">
									Account settings
								</Link>
								<Link href="#" className="text-muted-foreground block rounded-md px-2 py-2 font-medium">
									Billing
								</Link>
								<Link href="#" className="text-muted-foreground block rounded-md px-2 py-2 font-medium">
									Sign out
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
