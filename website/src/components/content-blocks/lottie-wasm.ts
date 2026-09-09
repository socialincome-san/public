/**
 * The dotLottie renderer fetches its WASM binary from jsDelivr by default, which our CSP does not allow.
 * The binary is copied out of the installed package by `npm run lottie:copy-wasm` so we can serve it ourselves.
 */
export const LOTTIE_WASM_PUBLIC_PATH = '/assets/lottie/dotlottie-player.wasm';
