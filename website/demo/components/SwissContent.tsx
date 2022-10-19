import {useTranslation} from 'next-i18next'

export const SwissContent = () => {

    const {t} = useTranslation('swiss-content')

    return (
        <div>
            <h2>
                {t('only-for-swiss')}
            </h2>
            <img alt="swiss" src={"https://i.gifer.com/5CKl.gif"}/>
        </div>
    )
}
