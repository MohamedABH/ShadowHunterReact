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
			className="px-3 py-2 text-primary transition hover:bg-lilac_ash-400"
			to={to}
		>
			{children}
		</Link>
	);
};

const Navbar: React.FC<NavbarProps> = ({ loggedIn, username }) => {
	return (
		<header className="bg-accent text-primary shadow-lg">
			<nav className="flex items-center px-4 py-4 text-base">
				{/* Logo/Brand */}
				<Link to="/" className="shrink-0 text-2xl text-primary">
					Takaro
				</Link>

				{/* Navigation Links (Center) */}
				<div className="flex gap-2 px-8">
					<NavLinkItem to="/games">Parties</NavLinkItem>
					<NavLinkItem to="/myGame">Ma partie</NavLinkItem>
				</div>

				{/* Auth Links (Right) */}
				<div className="ml-auto flex items-center gap-2">
					{!loggedIn ? (
						<>
							<NavLinkItem to="/login">Connexion</NavLinkItem>
							<NavLinkItem to="/register">Inscription</NavLinkItem>
						</>
					) : null}
					{loggedIn ? (
						<>
							{username ? (
								<span className="px-3 py-2 font-semibold text-parchment">
									Bonjour, {username}
								</span>
							) : null}
							<NavLinkItem to="/logout">Déconnexion</NavLinkItem>
						</>
					) : null}
				</div>
			</nav>
		</header>
	);
};

export default Navbar;
