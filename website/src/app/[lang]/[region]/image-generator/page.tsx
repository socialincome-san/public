import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { login } from './actions';
import { isSessionValid } from './session';

export default async function Page() {
	const authenticated = await isSessionValid();
	if (authenticated == true) {
		return (
			<div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
				<h1 className="text-foreground mb-5 text-center text-xl font-semibold">Test</h1>
				<textarea className="placeholder:text-muted-foreground border-border text-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-2xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden focus-visible:ring-[3px]"></textarea>
				<button>Generate</button>
			</div>
		);
	}
	return (
		<form action={login} className="flex min-h-[40vh] flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
			<Input className="w-full max-w-xl" name="password" type="password" placeholder="Password" />
			<Button type="submit" className="mx-auto rounded-full px-6">
				Login
			</Button>
		</form>
	);
}
