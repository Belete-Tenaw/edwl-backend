import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, WifiOff, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { checkPlatformHealth } from '../services/platformHealth';

const CHECK_DELAY_MS = 900;

const PlatformStatusBanner = () => {
    const { t } = useTranslation();
    const [status, setStatus] = useState({ checked: false, ok: true });
    const [dismissed, setDismissed] = useState(false);
    const [checking, setChecking] = useState(false);

    const runCheck = async () => {
        setChecking(true);
        const result = await checkPlatformHealth();
        setStatus({ checked: true, ...result });
        setChecking(false);
        if (result.ok) setDismissed(false);
    };

    useEffect(() => {
        const timer = setTimeout(runCheck, CHECK_DELAY_MS);
        const handleOnline = () => runCheck();
        const handleFocus = () => runCheck();

        window.addEventListener('online', handleOnline);
        window.addEventListener('focus', handleFocus);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    if (!status.checked || status.ok || dismissed) return null;

    const Icon = status.reason === 'offline' ? WifiOff : AlertTriangle;

    return (
        <div className="platform-status-banner" role="status" aria-live="polite">
            <div className="platform-status-inner">
                <Icon size={20} />
                <div className="platform-status-copy">
                    <strong>{t('platform_status_title')}</strong>
                    <span>{t('platform_status_desc')}</span>
                </div>
                <button type="button" className="platform-status-action" onClick={runCheck} disabled={checking}>
                    <RefreshCw size={16} className={checking ? 'spin-soft' : ''} />
                    {checking ? t('checking') : t('retry')}
                </button>
                <button
                    type="button"
                    className="platform-status-close"
                    onClick={() => setDismissed(true)}
                    aria-label={t('dismiss')}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default PlatformStatusBanner;
