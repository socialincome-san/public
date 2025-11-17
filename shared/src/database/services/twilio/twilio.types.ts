export type VerifyOtpRequest = {
	phoneNumber: string;
	otp: string;
};

export type VerifyOtpResult = {
	success: true;
	customToken: string;
	isNewUser: boolean;
	uid: string;
};
