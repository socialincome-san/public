import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { DefaultPageProps } from "@/app/[lang]/[country]";

export default async function Page({ params }: DefaultPageProps) {
  const translator = await Translator.getInstance({
    language: params.lang,
    namespaces: ['website-impact'],
  });

  return (
    <div className="bg-yellow-50">
      <BaseContainer className="flex flex-col items-center space-y-12 py-8 min-h-screen">

        {/* Linked manually but could be done with GitHub's API in the future */}
        <div className="pt-4">
          <a href="https://github.com/socialincome-san/public/issues/609" target="_blank" rel="noopener noreferrer" className="group flex items-center pl-2 pr-2 py-2 bg-black bg-opacity-5 hover:bg-black focus:outline-none focus:ring-4 focus:ring-primary font-medium rounded-full text-base text-black/80 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-dark hover:bg-opacity-10">
            <img src="https://avatars.githubusercontent.com/u/9919?v=4" className="w-10 h-10 rounded-full mr-2 group-hover:scale-110 transition-transform duration-300" alt="Avatar" />
            <span className="text-lg text-black/75 pl-3 pr-6">{translator.t('issue-unassigned')}</span>
          </a>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 space-y-12 w-full px-5 sm:px-4">
          <Typography as="h1" size="5xl" weight="bold" lineHeight="tight" className="mx-auto text text-center" >{translator.t('title')}</Typography>
          <Typography as="h2" size="3xl" lineHeight="snug" className="max-w-3xl mx-auto text text-center">
            {translator.t('subtitle')}</Typography>

          <div className="flex justify-center space-x-4">

            {/* Button 1 */}
            <a href="https://github.com/socialincome-san/public/issues/550" className="inline-flex items-center justify-center p-5 text-base font-medium text-black/75 rounded-lg hover:text-gray-900 transition-opacity duration-300 hover:bg-black hover:bg-opacity-5 hover:text-black/100" target="_blank">
              <svg aria-hidden="true" className="w-8 h-8 mr-3" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.69-.01-1.35-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.66-.89-3.66-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.88 3.74-3.68 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38 3.18-1.06 5.47-4.05 5.47-7.59 0-4.42-3.58-8-8-8z"/>
              </svg>
              <span className="w-full">GitHub Issue</span>
            </a>

            {/* Button 2 */}
            <a href="https://www.figma.com/proto/qGO3YI21AWIjWEyMPGUczM/Website-Social?type=design&node-id=0-1&viewport=1062%2C135%2C0.21&t=jG5pilvATJ4817xv-0&scaling=contain&starting-point-node-id=384%3A3164&show-proto-sidebar=1" className="inline-flex items-center justify-center p-5 text-base font-medium text-black/75 rounded-lg hover:text-gray-900 transition-opacity duration-300 hover:bg-black hover:bg-opacity-5 hover:text-black/100" target="_blank">
              <svg aria-hidden="true" className="w-5 h-5 mr-3" viewBox="0 0 22 31" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4151_63004)"><path d="M5.50085 30.1242C8.53625 30.1242 10.9998 27.8749 10.9998 25.1035V20.0828H5.50085C2.46546 20.0828 0.00195312 22.332 0.00195312 25.1035C0.00195312 27.8749 2.46546 30.1242 5.50085 30.1242Z" fill="#0ACF83"/><path d="M0.00195312 15.062C0.00195312 12.2905 2.46546 10.0413 5.50085 10.0413H10.9998V20.0827H5.50085C2.46546 20.0827 0.00195312 17.8334 0.00195312 15.062Z" fill="#A259FF"/><path d="M0.00195312 5.02048C0.00195312 2.24904 2.46546 -0.000244141 5.50085 -0.000244141H10.9998V10.0412H5.50085C2.46546 10.0412 0.00195312 7.79193 0.00195312 5.02048Z" fill="#F24E1E"/><path d="M11 -0.000244141H16.4989C19.5343 -0.000244141 21.9978 2.24904 21.9978 5.02048C21.9978 7.79193 19.5343 10.0412 16.4989 10.0412H11V-0.000244141Z" fill="#FF7262"/><path d="M21.9978 15.062C21.9978 17.8334 19.5343 20.0827 16.4989 20.0827C13.4635 20.0827 11 17.8334 11 15.062C11 12.2905 13.4635 10.0413 16.4989 10.0413C19.5343 10.0413 21.9978 12.2905 21.9978 15.062Z" fill="#1ABCFE"/></g><defs><clipPath id="clip0_4151_63004"><rect width="22" height="30.1244" fill="white" transform="translate(0 -0.000244141)"/></clipPath></defs></svg>
              <span className="w-full">Figma Design</span>
            </a>

          </div>
        </div>
      </BaseContainer>
    </div>
  );
}
