export type VerifyOtpRequest = {
	phoneNumber: string;
	otp: string;
};

export type VerifyOtpResult = {
	customToken: string;
	isNewUser: boolean;
	uid: string;
};
