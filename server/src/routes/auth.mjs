import passport from "passport";
import { Router } from "express";

const router = Router();

router.post(
	"/api/auth",
	passport.authenticate("local"),
	(request, response) => {
		response.sendStatus(200);
	}
);

router.get("/api/auth/status", (request, response) => {
	return request.user ? response.send(request.user) : response.sendStatus(401);
});

router.get("/api/auth/logout", (request, response) => {
	request.session.destroy(function (err) {
		response.send('Logout Successful');
	});
});

router.get("/api/auth/github", passport.authenticate("github"));
router.get(
	"/api/auth/github/redirect",
	passport.authenticate("github", {
		successRedirect: 'http://localhost:3000/',
		failureRedirect: '/api/auth/github/failure'
	})
);

export default router;