import React, { useEffect, useMemo, useState } from 'react';
import { Download, MoreVertical, PlusCircle, Share2, Smartphone, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SESSION_DISMISS_KEY = 'edwlPwaInstallDismissedThisSession';
const INSTALLED_KEY = 'edwlPwaInstalled';

const isRunningStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone;

const detectDevice = () => {
    const userAgent = window.navigator.userAgent || '';
    const isIos = /iphone|ipad|ipod/i.test(userAgent) ||
        (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(userAgent);
    const isMobileViewport = window.matchMedia?.('(max-width: 768px)').matches;

    return {
        isIos,
        isAndroid,
        isMobile: isIos || isAndroid || isMobileViewport
    };
};

const PwaInstallPrompt = () => {
    const { t } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [device, setDevice] = useState({ isIos: false, isAndroid: false, isMobile: false });

    const manualSteps = useMemo(() => {
        if (device.isIos) {
            return [
                { icon: Share2, label: t('pwa_step_ios_share') },
                { icon: PlusCircle, label: t('pwa_step_ios_add') },
                { icon: Smartphone, label: t('pwa_step_ios_confirm') }
            ];
        }

        return [
            { icon: MoreVertical, label: t('pwa_step_android_menu') },
            { icon: PlusCircle, label: t('pwa_step_android_add') },
            { icon: Smartphone, label: t('pwa_step_android_confirm') }
        ];
    }, [device.isIos, t]);

    const isManualPrompt = !deferredPrompt;

    useEffect(() => {
        const currentDevice = detectDevice();
        setDevice(currentDevice);

        if (isRunningStandalone()) {
            localStorage.setItem(INSTALLED_KEY, 'true');
            setIsVisible(false);
            return undefined;
        }

        const wasDismissed = sessionStorage.getItem(SESSION_DISMISS_KEY) === 'true';
        const wasInstalled = localStorage.getItem(INSTALLED_KEY) === 'true';

        const handler = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
            if (!wasDismissed && !wasInstalled) {
                setIsVisible(true);
            }
        };

        const handleInstalled = () => {
            localStorage.setItem(INSTALLED_KEY, 'true');
            setDeferredPrompt(null);
            setIsVisible(false);
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', handleInstalled);

        const fallbackTimer = window.setTimeout(() => {
            if (!wasDismissed && !wasInstalled && currentDevice.isMobile && !isRunningStandalone()) {
                setIsVisible(true);
            }
        }, 1200);

        return () => {
            window.clearTimeout(fallbackTimer);
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', handleInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            localStorage.setItem(INSTALLED_KEY, 'true');
        } else {
            sessionStorage.setItem(SESSION_DISMISS_KEY, 'true');
        }
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        sessionStorage.setItem(SESSION_DISMISS_KEY, 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={`pwa-install-banner${isManualPrompt ? ' manual' : ''}`} role="dialog" aria-live="polite" aria-label={t('pwa_install_title')}>
            <img src="/edwl_logo.png" alt="EDWL Logo" className="pwa-install-logo" />
            <div className="pwa-install-copy">
                <div className="pwa-install-badge">
                    <Smartphone size={13} />
                    {t('pwa_install_badge')}
                </div>
                <h4>{isManualPrompt ? t('pwa_install_manual_title') : t('pwa_install_title')}</h4>
                <p>
                    {deferredPrompt
                        ? t('pwa_install_native_desc')
                        : device.isIos
                            ? t('pwa_install_ios_desc')
                            : t('pwa_install_android_desc')}
                </p>
                {isManualPrompt && (
                    <ol className="pwa-install-steps">
                        {manualSteps.map(({ icon: Icon, label }) => (
                            <li key={label}>
                                <Icon size={15} />
                                <span>{label}</span>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
            <div className="pwa-install-actions">
                {deferredPrompt && (
                    <button type="button" className="pwa-install-btn" onClick={handleInstallClick}>
                        <Download size={16} />
                        {t('pwa_install_button')}
                    </button>
                )}
                <button
                    type="button"
                    className="pwa-dismiss-btn"
                    aria-label={t('pwa_dismiss_label')}
                    onClick={handleDismiss}
                >
                    <X size={18} />
                    <span>{t('pwa_not_now')}</span>
                </button>
            </div>
        </div>
    );
};

export default PwaInstallPrompt;
