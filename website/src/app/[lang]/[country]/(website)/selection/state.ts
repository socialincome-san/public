export type FutureDraw = {
    time: number
    name: string
    count: number
    total: number
}

export type PastDraw = {
    time: number
    name: string
    count: number
    total: number
    drandRound: number
    drandRandomness: string
    commitHash: string
}

export const futureDraws: Array<FutureDraw> = [{
    time: new Date(2023, 9, 15, 12).getUTCMilliseconds(),
    name: "Aurora Draw",
    count: 10,
    total: 400
}]

export const pastDraws: Array<PastDraw> = [{
    time: Date.now(),
    name: "some great draw",
    count: 10,
    total: 400,
    drandRandomness: "deadbeefdeadbeefdeadbeefdeadbeef",
    drandRound: 5,
    commitHash: "abc1234"
}, {
    time: Date.now() - (1000 * 60 * 60 * 24),
    name: "great draw1234",
    count: 8,
    total: 200,
    drandRound: 5,
    drandRandomness: "deadbeefdeadbeefdeadbeefdeadbeef",
    commitHash: "abc1234"
}]