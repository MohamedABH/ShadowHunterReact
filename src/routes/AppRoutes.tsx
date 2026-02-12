import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Games from "../pages/Games";
import GameCreation from "../pages/GameCreation";
import MyGame from "../pages/MyGame";
import Logout from "../pages/Logout";

type AppRoutesProps = {
	loggedIn: boolean;
};

const AppRoutes: React.FC<AppRoutesProps> = ({ loggedIn }) => {
	return (
		<Routes>
			<Route
				path="/login"
				element={loggedIn ? <Navigate to="/games" replace /> : <Login />}
			/>
			<Route
				path="/register"
				element={loggedIn ? <Navigate to="/games" replace /> : <Register />}
			/>
			<Route path="/games" element={<Games />} />
			<Route path="/games/create" element={<GameCreation />} />
			<Route path="/myGame" element={<MyGame />} />
			<Route
				path="/logout"
				element={loggedIn ? <Logout /> : <Navigate to="/login" replace />}
			/>
		</Routes>
	);
};

export default AppRoutes;
