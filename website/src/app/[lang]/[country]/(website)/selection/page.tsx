'use client';
import * as React from "react"
import {BaseContainer, Typography} from "@socialincome/ui"
import {Translator} from "@socialincome/shared/src/utils/i18n"
import {DefaultPageProps} from "@/app/[lang]/[country]"
import {LoaderIcon} from "react-hot-toast"
import {ChevronDownIcon} from "@heroicons/react/20/solid"
import {useEffect, useState} from "react"
import {Disclosure} from "@headlessui/react"

export default function Page(props: DefaultPageProps) {
    const [translator, setTranslator] = useState<Translator>();

    useEffect(() => {
        Translator.getInstance({
            language: props.params.lang,
            namespaces: ['website-selection'],
        }).then(t => setTranslator(t));
    }, [props.params.lang])

    if (!translator) {
        return <LoaderIcon></LoaderIcon>
    }

    return (
        <BaseContainer className="bg-base-blue min-h-screen">
            <div className="p-2">
                <Typography size="xl">
                    {translator?.t("read-draws")}
                    <a className="underline" href="https://some-blog-post.com">{translator?.t("read-draws-link")}</a>
                    {translator?.t("read-draws-2")}
                </Typography>
            </div>
            <Typography as="h2" size="3xl">{translator?.t("upcoming")}</Typography>
            <Typography>{translator?.t("future-draws")}</Typography>

            {futureDraws.map(draw =>
                <Collapsible
                    key={draw.time}
                    summary={<DrawSummary draw={draw}/>}
                />)
            }

            <Typography as="h2" size="3xl">{translator?.t("past")}</Typography>
            {pastDraws.map(draw =>
                <Collapsible
                    key={draw.time}
                    summary={<DrawSummary draw={draw}/>}
                    detail={<DrawDetail draw={draw}/>}
                />)
            }
        </BaseContainer>
    )
}

interface CollapsibleProps extends React.PropsWithChildren {
    summary: React.ReactNode
    detail?: React.ReactNode
}

// a collapsible element rendering the summary, and optionally a button to open the detailed view
function Collapsible(props: CollapsibleProps) {
    return (
        <Disclosure>
            <div className="bg-gray-200 shadow-xl p-2 m-4">
                <div className="h-20 flex flex-row w-full h-full items-center">
                    <div className="grow">
                        {props.summary}
                    </div>
                    <div>
                        {!!props.detail
                            ? <Disclosure.Button>
                                <ChevronDownIcon height="2em"></ChevronDownIcon>
                            </Disclosure.Button>
                            /* this is a filthy hack for spacing, but is actually responsive by some sorcery */
                            : <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        }
                    </div>
                </div>
                {!!props.detail && <Disclosure.Panel>{props.detail}</Disclosure.Panel>}
            </div>
        </Disclosure>
    )
}

type DrawSummaryProps = {
    draw: PastDraw | FutureDraw,
    translator?: Translator

}

function DrawSummary({draw, translator}: DrawSummaryProps) {
    return (
        <div className="flex flex-row w-full h-full items-center">
            <div className="basis-1/4">
                {new Date(draw.time).toLocaleDateString()}
            </div>
            <div className="grow">
                {draw.name}
            </div>
            <div className="basis-1/4">
                {draw.count} {translator?.t("from")} {draw.total}
            </div>
        </div>
    )
}

type DrawDetailProps = {
    draw: PastDraw,
    translator?: Translator
}

function DrawDetail({draw, translator}: DrawDetailProps) {
    return (
        <div>
            <div className="flex p-2 justify-between">
                <div>
                    <Typography weight="bold">{translator?.t("random-number")}:</Typography>
                    <Typography>{draw.drandRandomness}</Typography>
                </div>
                <div>
                    <a
                        className="underline"
                        href={`https://api.drand.sh/public/${draw.drandRound}`}
                    >{translator?.t("confirm-drand")}</a>
                </div>
            </div>
            <div className="flex p-2 justify-between">
                <div>
                    <Typography weight="bold">People:</Typography>
                    <Typography>{translator?.t("longlist", {
                        context: {
                            total: draw.total,
                            count: draw.count
                        }
                    })}</Typography>
                </div>
                <div>
                    <a
                        className="underline"
                        href={`https://github.com/socialincome-san/public/tree/main/lists${draw.name}`}
                    >
                        {translator?.t("confirm-github")}
                    </a>
                </div>
            </div>
        </div>
    )
}

type FutureDraw = {
    time: number
    name: string
    count: number
    total: number
}

const futureDraws: Array<FutureDraw> = [{
    time: Date.now() + (1000 * 60 * 60 * 24),
    name: "some great future draw",
    count: 5,
    total: 500
}, {
    time: Date.now() + (1000 * 60 * 60 * 24 * 2),
    name: "some other draw",
    count: 2,
    total: 500
}]

type PastDraw = {
    time: number
    name: string
    count: number
    total: number
    drandRound: number
    drandRandomness: string
    commitHash: string
}

const pastDraws: Array<PastDraw> = [{
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