import React from 'react';
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from './Toast';

const EDWL_SHARE_URL = 'https://ethiodomesticworkers.web.app';

const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
};

const ShareEdwlButton = ({ className = '', compact = false, children }) => {
    const { t } = useTranslation();
    const addToast = useToast();

    const handleShare = async () => {
        const shareData = {
            title: t('share_edwl_title'),
            text: t('share_edwl_text'),
            url: EDWL_SHARE_URL
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                addToast(t('share_edwl_thanks'), 'success');
                return;
            }

            await copyToClipboard(EDWL_SHARE_URL);
            addToast(t('share_edwl_copied'), 'success');
        } catch (error) {
            if (error?.name === 'AbortError') return;

            try {
                await copyToClipboard(EDWL_SHARE_URL);
                addToast(t('share_edwl_copied'), 'success');
            } catch {
                addToast(t('share_edwl_failed'), 'info', 7000);
            }
        }
    };

    return (
        <button
            type="button"
            className={`share-edwl-button${compact ? ' compact' : ''}${className ? ` ${className}` : ''}`}
            onClick={handleShare}
        >
            <Share2 size={compact ? 16 : 18} />
            <span>{children || t(compact ? 'share_edwl_short' : 'share_edwl')}</span>
        </button>
    );
};

export default ShareEdwlButton;
