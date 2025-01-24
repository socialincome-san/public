'use client'

import {useApi} from '@/hooks/useApi';
import * as z from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {CreateNewsletterSubscription} from '@/app/api/newsletter/subscription/public/route';
import toast from 'react-hot-toast';
import {Button, Form, FormControl, FormField, FormItem, FormMessage, Input} from '@socialincome/ui';

const NewsletterForm = ({ lang, t, translations }) => {
    const api = useApi();
    const formSchema = z.object({ email: z.string().email() });
    type FormSchema = z.infer<typeof formSchema>;
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = async (values: FormSchema) => {
        const body: CreateNewsletterSubscription = {
            email: values.email,
            language: lang === 'de' ? 'de' : 'en',
        };
        api.post('/api/newsletter/subscription/public', body).then((response) => {
            if (response.status === 200) {
                toast.dismiss(t.id);
                toast.success(translations.toastSuccess);
            } else {
                toast.error(translations.toastFailure);
            }
        });
    };

    return (
        <Form {...form}>
            <form className="flex gap-2 flex-col sm:flex-row justify-center w-full items-center" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="flex-1 max-w-full sm:max-w-96 w-full">
                            <FormControl>
                                <Input type="email" placeholder={translations.emailPlaceholder} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full sm:w-full sm:max-w-[10rem]">{translations.buttonAddSubscriber}</Button>
            </form>
        </Form>
    );
};

export default NewsletterForm;
