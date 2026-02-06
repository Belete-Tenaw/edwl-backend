import React from 'react';
import BackButton from '../components/BackButton';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <BackButton />
            <h1 className="text-3xl font-bold mb-6">{t('privacy_policy_title')}</h1>

            <section className="mb-6">
                <p className="mb-4 text-gray-600">{t('privacy_intro', { date: new Date().toLocaleDateString() })}</p>
                <h2 className="text-xl font-semibold mb-2">{t('privacy_1_title')}</h2>
                <p>{t('privacy_1_text')}</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{t('privacy_2_title')}</h2>
                <p>{t('privacy_2_text')}</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{t('privacy_3_title')}</h2>
                <p>{t('privacy_3_text')}</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{t('privacy_4_title')}</h2>
                <p>{t('privacy_4_text')} support@edwl.com</p>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
