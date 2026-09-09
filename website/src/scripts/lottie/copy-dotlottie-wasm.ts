import { LOTTIE_WASM_PUBLIC_PATH } from '@/components/content-blocks/lottie-wasm';
import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const sourcePath = createRequire(import.meta.url).resolve('@lottiefiles/dotlottie-web/dotlottie-player.wasm');
const targetPath = path.join(process.cwd(), 'public', LOTTIE_WASM_PUBLIC_PATH);

const copyWasm = async () => {
	await mkdir(path.dirname(targetPath), { recursive: true });
	await copyFile(sourcePath, targetPath);
};

void copyWasm().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
