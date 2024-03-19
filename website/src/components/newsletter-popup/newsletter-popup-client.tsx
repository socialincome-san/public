import { MailchimpSubscriptionData } from '@socialincome/shared/src/mailchimp/MailchimpAPI';
import { Button, Input, Label } from '@socialincome/ui';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

type NewsletterPopupClientProps = {
	toast: any;
	translations: {
		errorNoEmail: string;
		errorInvalidEmail: string;
		informationLabel: string;
		toastSuccess: string;
		toastFailure: string;
		emailPlaceholder: string;
		buttonAddSubscriber: string;
	};
};

export const NewsletterPopupClient = (newsletterPopupClientProps: NewsletterPopupClientProps) => {
	const [email, setEmail] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const validateEmail = (email: string) => {
		return email.match(
			/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/,
		);
	};

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		if (!email) {
			setErrorMessage(newsletterPopupClientProps.translations.errorNoEmail);
			return;
		}
		if (!validateEmail(email)) {
			setErrorMessage(newsletterPopupClientProps.translations.errorInvalidEmail);
			return;
		}
		setErrorMessage('');
		const data: MailchimpSubscriptionData = {
			email: email,
			status: 'subscribed',
		};
		// Call the API to change Mailchimp subscription
		fetch('/api/mailchimp/subscription/public', { method: 'POST', body: JSON.stringify(data) }).then((response) => {
			if (response.status === 200) {
				toast.dismiss(newsletterPopupClientProps.toast.id);
				toast.success(newsletterPopupClientProps.translations.toastSuccess);
			} else {
				toast.dismiss(newsletterPopupClientProps.toast.id);
				toast.error(newsletterPopupClientProps.translations.toastFailure);
			}
		});
		setEmail('');
	};

	const onClose = () => {
		toast.dismiss(newsletterPopupClientProps.toast.id);
	};

	return (
		<div className={`${newsletterPopupClientProps.toast.visible ? 'animate-enter' : 'animate-leave'} w-full bg-white`}>
			<div className="flex w-full p-2">
				<div className="flex w-full items-start ">
					<div className="mb-2 w-full">
						<Label className="w-full">{newsletterPopupClientProps.translations.informationLabel}</Label>
					</div>
					<form onSubmit={handleSubmit} className="w-full">
						<Input
							name="email"
							id="email"
							placeholder={newsletterPopupClientProps.translations.emailPlaceholder}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 w-full"
							required
						/>
						{errorMessage && <p className="text-xs italic text-red-500">{errorMessage}</p>}
						<div className="w-full py-2">
							<Button
								type="submit"
								className="inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm"
							>
								{newsletterPopupClientProps.translations.buttonAddSubscriber}
							</Button>
						</div>
					</form>
				</div>
				<button
					onClick={onClose}
					className="absolute right-0 top-0 p-4 text-black hover:text-red-500"
					aria-label="Close"
				>
					x
				</button>
			</div>
		</div>
	);
};
