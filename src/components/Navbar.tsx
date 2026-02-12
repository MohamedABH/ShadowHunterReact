import React from "react";
import { Link } from "react-router-dom";

type NavbarProps = {
	loggedIn: boolean;
	username: string;
};

type NavLinkItemProps = {
	to: string;
	children: React.ReactNode;
};

const NavLinkItem: React.FC<NavLinkItemProps> = ({ to, children }) => {
	return (
		<Link
			className="rounded-md px-2 py-1 text-primary transition hover:bg-dusty_grape hover:text-parchment-700"
			to={to}
		>
			{children}
		</Link>
	);
};

const Navbar: React.FC<NavbarProps> = ({ loggedIn, username }) => {
	return (
		<header className="bg-accent text-primary">
			<nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-4 text-sm">
				{!loggedIn ? (
					<>
						<NavLinkItem to="/login">Connexion</NavLinkItem>
						<NavLinkItem to="/register">Inscription</NavLinkItem>
					</>
				) : null}
				<NavLinkItem to="/games">Parties</NavLinkItem>
				<NavLinkItem to="/myGame">Ma partie</NavLinkItem>
				{loggedIn ? (
					<div className="ml-auto flex items-center gap-2">
						{username ? (
							<span className="px-2 py-1 text-parchment-700">
								Bonjour, {username}
							</span>
						) : null}
						<NavLinkItem to="/logout">Déconnexion</NavLinkItem>
					</div>
				) : null}
			</nav>
		</header>
	);
};

export default Navbar;
