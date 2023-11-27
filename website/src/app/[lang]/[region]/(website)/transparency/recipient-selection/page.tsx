import {DefaultPageProps} from '@/app/[lang]/[region]';
import {
    DrawCard,
    DrawDetail, DrawHeader,
    DrawSummary
} from '@/app/[lang]/[region]/(website)/transparency/recipient-selection/drawCard';
import {loadPastDraws} from '@/app/[lang]/[region]/(website)/transparency/recipient-selection/state';
import {Translator} from '@socialincome/shared/src/utils/i18n';
import {BaseContainer, Typography} from '@socialincome/ui';
import {Explainer} from "@/app/[lang]/[region]/(website)/transparency/recipient-selection/explainer"

export default async function Page(props: DefaultPageProps) {
    const translator = await Translator.getInstance({language: props.params.lang, namespaces: 'website-selection'});

    const pastDraws = await loadPastDraws().catch(_ => []);
    // sort the draws in descending order by time
    pastDraws.sort((a, b) => b.time - a.time);

    return (
        <BaseContainer className="bg-base-blue min-h-screen">
            <Explainer />
            <Typography as="h2" size="3xl">
                {translator.t('past')}
            </Typography>

            {pastDraws.length === 0 && <Typography>{translator.t('none-completed')}</Typography>}


            <DrawHeader />
            {pastDraws.map((draw) => (
                <DrawCard
                    key={draw.time}
                    summary={
                        <DrawSummary
                            draw={draw}
                            translations={{
                                from: translator.t('from'),
                            }}
                        />
                    }
                    detail={
                        <DrawDetail
                            draw={draw}
                            translations={{
                                randomNumber: translator.t('random-number'),
                                confirmGithub: translator.t('confirm-github'),
                                confirmDrand: translator.t('confirm-drand'),
                                people: translator.t('people'),
                                longlist: translator.t('long-list', {context: {total: draw.total, count: draw.count}}),
                            }}
                        />
                    }
                />
            ))}
        </BaseContainer>
    );
}

