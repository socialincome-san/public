export type VerifyOtpRequest = {
	phoneNumber: string;
	otp: string;
};

export type VerifyOtpResult = {
	success: true;
	token: string;
	isNewUser: boolean;
	uid: string;
};