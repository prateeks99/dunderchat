export const createUserValidationSchema = {
	username: {
		trim: true,
		toLowerCase: true,
		isLength: {
			options: {
				min: 5,
				max: 32,
			},
			errorMessage:
				"Username must be at least 5 characters with a max of 32 characters",
		},
		matches: {
			options: [/^[a-z0-9._-]+$/],
			errorMessage: "Username can only use letters, numbers, dots, dashes and underscores",
		},
		notEmpty: {
			errorMessage: "Username cannot be empty",
		},
		isString: {
			errorMessage: "Username must be a string!",
		},
	},
	displayName: {
		trim: true,
		notEmpty: {
			errorMessage: "Full name cannot be empty",
		},
		isLength: {
			options: { max: 40 },
			errorMessage: "Full name can be at most 40 characters",
		},
	},
	password: {
		isLength: {
			options: { min: 6, max: 128 },
			errorMessage: "Password must be at least 6 characters",
		},
	},
};
