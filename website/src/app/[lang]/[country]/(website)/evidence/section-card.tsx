import { Translator } from '@socialincome/shared/src/utils/i18n';
import {Card, CardTitle, Typography, Dialog, DialogTitle, DialogTrigger, DialogContent, DialogHeader, DialogDescription, DialogFooter, Button, } from '@socialincome/ui';
import Link from 'next/link';
import { DefaultParams } from '@/app/[lang]/[country]';
import { SectionParagraph } from './section-paragraph';

type SectionCardProps = {
    section: number;
    cardNumber: number;
    params: DefaultParams;
}


export async function SectionCard({ section, cardNumber, params}: SectionCardProps){

    const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-evidence'],
	});

    const p = translator.t(`section-${section}.cards.card-${cardNumber}.paragraphs`, {returnObjects: true});
    let paragraphs: Object[] = [];
    for(const paragraph in p){paragraphs.push(paragraph);}
    let i = 0;


	return (
		<Dialog>
			<DialogTrigger>
				<Card className='bg-inherit border-black border w-full py-4 px-10 text-left scale-100 hover:scale-105 ease-in duration-200'>
					<CardTitle className='text-red-400 py-2 '>{translator.t(`section-${section}.cards.card-${cardNumber}.title`)}</CardTitle>
					<Typography size='lg'>{translator.t(`section-${section}.cards.card-${cardNumber}.description`)}</Typography>
				</Card>
			</DialogTrigger>
			<DialogContent className='w-full'>
				<DialogHeader>
					<DialogTitle>
						<Typography size='2xl' weight='bold'>{translator.t(`section-${section}.cards.card-${cardNumber}.title`)}</Typography>
					</DialogTitle>
				</DialogHeader>
				<DialogDescription>
                    {
                        paragraphs.map((paragraph, key)=>{
                            i++; return(
                                <div className='mb-3'>
                                    <SectionParagraph section={section} cardNumber={cardNumber} paragraphNumber={i} params={params} key={key} />
                                </div>
                            )
                        })
                    }
					<br/>
				</DialogDescription>
				<DialogFooter>
					<Link href="/get-involved">
						<Button>{translator.t('take-action')}</Button>
					</Link>
				</DialogFooter>

			</DialogContent>
		</Dialog>
	);
}
