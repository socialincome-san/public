'use client';
import * as React from "react"
import {BaseContainer, Typography} from "@socialincome/ui"
import {Translator} from "@socialincome/shared/src/utils/i18n"
import {DefaultPageProps} from "@/app/[lang]/[country]"
import {LoaderIcon} from "react-hot-toast"
import {ChevronDownIcon} from "@heroicons/react/20/solid"
import {useEffect, useState} from "react"
import {Disclosure} from "@headlessui/react"

interface SelectionPageProps extends DefaultPageProps {

}

export default function Page(props: SelectionPageProps) {
    const [translator, setTranslator] = useState<Translator>();

    useEffect(() => {
        const translator = Translator.getInstance({
            language: props.params.lang,
            namespaces: ['website-selection'],
        }).then(t => setTranslator(t));
    }, [])

    if (!translator) {
        return <LoaderIcon></LoaderIcon>
    }
    return (
        <BaseContainer className="bg-base-blue min-h-screen">
            <Typography as="h2" size="3xl">{translator?.t("upcoming")}</Typography>
            <Typography>Future draws for new recipients are announced here and depend on the financial possibilities of
                Social Income.</Typography>
            {draws.map(draw => <DrawCard key={draw.commitHash} draw={draw}/>)}

            <Typography as="h2" size="3xl">{translator?.t("past")}</Typography>
            {draws.map(draw => <DrawCard key={draw.commitHash} draw={draw}/>)}
        </BaseContainer>
    )
}

type DrawCardProps = {
    draw: Draw
}

function DrawCard({draw}: DrawCardProps) {
    return (
        <Disclosure>
            <div className={"bg-gray-200 shadow-xl p-2 m-4"}>
                <div className={"flex flex-row w-full justify-items-start"}>
                    <div className={"basis-1/4"}>
                        {new Date(draw.time).toLocaleDateString()}
                    </div>
                    <div className={"grow"}>
                        {draw.name}
                    </div>
                    <div className={"basis-1/4"}>
                        {draw.count} from {draw.total}
                    </div>
                    <Disclosure.Button>
                        <div>
                            <ChevronDownIcon height={"2em"}></ChevronDownIcon>
                        </div>
                    </Disclosure.Button>
                </div>
                <Disclosure.Panel>
                    <div className={"flex p-2 justify-between"}>
                        <div>
                            <Typography weight={"bold"}>Random number:</Typography>
                            <Typography>{draw.drandRandomness}</Typography>
                        </div>
                        <div>
                            <a
                                className={"underline"}
                                href={`https://api.drand.sh/public/${draw.drandRound}`}
                            >Confirm on drand
                            </a>
                        </div>
                    </div>
                    <div className={"flex p-2 justify-between"}>
                        <div>
                            <Typography weight={"bold"}>People:</Typography>
                            <Typography>{draw.total} people on the long list. {draw.count} selected</Typography>
                        </div>
                        <div>
                            <a
                                className={"underline"}
                                href={`https://github.com/socialincome-san/public/tree/main/lists${draw.name}`}
                            >
                                Confirm on Github
                            </a>
                        </div>
                    </div>
                </Disclosure.Panel>
            </div>
        </Disclosure>
    )
}

type Draw = {
    time: number
    name: string
    count: number
    total: number
    drandRound: number
    drandRandomness: string
    commitHash: string
}
const draws: Array<Draw> = [{
    time: Date.now(),
    name: "some great draw",
    count: 10,
    total: 400,
    drandRandomness: "deadbeefdeadbeefdeadbeefdeadbeef",
    drandRound: 5,
    commitHash: "abc1234"
}, {
    time: Date.now() - (1000 * 60 * 60 * 24),
    name: "some great draw",
    count: 8,
    total: 200,
    drandRound: 5,
    drandRandomness: "deadbeefdeadbeefdeadbeefdeadbeef",
    commitHash: "abc1234"
}]