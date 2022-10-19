import React from "react";
import Link from "next/link";
import {useRouter} from "next/router";
import {useTranslation} from "next-i18next";


export const Header = () => {
    const router = useRouter();

    const handleLocaleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;

        router.push(router.route, router.asPath, {
            locale: value,
        });
    };

    const {t} = useTranslation("header");

    return (
        <header>
            <div>
                <ul>
                    <li><Link href="/"><a>{t("home")}</a></Link></li>
                    <li><Link href="/second-page"><a>{t("second-page")}</a></Link></li>
                </ul>
            </div>
            <select onChange={handleLocaleChange} value={router.locale}>
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="de-CH"> German Switzerland</option>
            </select>
        </header>
    );
};
