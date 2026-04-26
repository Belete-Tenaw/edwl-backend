import React, { useState, useRef, useCallback } from 'react';
import { Camera, Video, Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import CameraCapture from './CameraCapture';
import VideoRecorder from './VideoRecorder';
import { useTranslation } from 'react-i18next';
import { useToast } from './Toast';

const MediaUploader = ({
    type = 'image', // 'image' or 'video'
    label,
    onFileSelect,
    previewUrl,
    required = false,
    id,
    captureMode = null, // 'user' (selfie/front cam) | 'environment' (doc/back cam) | null (auto)
}) => {
    const { t } = useTranslation();
    const addToast = useToast();
    const [showOptions, setShowOptions] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showVideoRecorder, setShowVideoRecorder] = useState(false);
    const fileInputRef = useRef(null);

    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // Determine the correct capture attribute for the hidden file input.
    // 'user' = front camera (selfies), 'environment' = back camera (documents)
    const getCaptureAttribute = () => {
        if (!isMobile()) return undefined;
        if (type === 'video') return 'user'; // video bios use front camera
        if (captureMode) return captureMode;  // explicit override from parent
        return 'environment'; // default: back cam for documents
    };

    const handleUploadClick = () => {
        setShowOptions(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
            const MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15MB

            if (type === 'image' && file.size > MAX_IMAGE_SIZE) {
                addToast(t('image_too_large') || 'Image is too large. Maximum size is 5MB.', 'error');
                e.target.value = '';
                return;
            }

            if (type === 'video' && file.size > MAX_VIDEO_SIZE) {
                addToast(t('video_too_large') || 'Video is too large. Maximum size is 15MB. Please choose a smaller file or record directly.', 'error');
                e.target.value = '';
                return;
            }
            
            if (type === 'image' && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
                addToast(t('invalid_image_format') || 'Please select a valid image or PDF file.', 'error');
                e.target.value = '';
                return;
            }

            if (type === 'video' && !file.type.startsWith('video/')) {
                addToast(t('invalid_video_format') || 'Please select a valid video format.', 'error');
                e.target.value = '';
                return;
            }

            onFileSelect(file, URL.createObjectURL(file));
        }
        setShowOptions(false);
    };

    const triggerNativeCapture = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleTakeMedia = () => {
        // Always use our in-browser recorder/camera for both mobile and desktop.
        // Native 'capture' attribute on mobile is unreliable — on Android it often
        // opens camera-only mode, skipping gallery, and produces blobs without
        // proper metadata headers needed by our video processor.
        if (type === 'image') {
            if (isMobile()) {
                triggerNativeCapture(); // Native camera is fine for still images
            } else {
                setShowCamera(true);
            }
        } else {
            // Video: always use in-browser VideoRecorder on all devices
            setShowVideoRecorder(true);
        }
        setShowOptions(false);
    };

    const handleUploadFromFile = () => {
        // Create a fresh temporary input to avoid the 'capture' attribute on the shared ref
        // interfering with gallery browsing on mobile devices.
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.accept = type === 'image' ? 'image/*,application/pdf' : 'video/*';
        tempInput.style.display = 'none';
        tempInput.onchange = handleFileChange;
        document.body.appendChild(tempInput);
        tempInput.click();
        // Clean up after selection or cancel
        setTimeout(() => document.body.removeChild(tempInput), 60000);
        setShowOptions(false);
    };

    const handleCapture = useCallback((file, url) => {
        // Unmount recorders first to avoid blocking the UI thread during subsequent processing
        setShowCamera(false);
        setShowVideoRecorder(false);
        setShowOptions(false);

        // Small delay to ensure modals are unmounted before parent re-renders with loading state
        setTimeout(() => {
            onFileSelect(file, url);
        }, 10);
    }, [onFileSelect]);

    return (
        <div className="media-uploader-container" style={{ marginBottom: '15px' }}>
            <label className="label" htmlFor={id}>
                {label} {required && <span style={{ color: 'red' }}>*</span>}
            </label>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                    type="button"
                    onClick={handleUploadClick}
                    className="btn-secondary"
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '12px 15px',
                        background: '#f8fafc',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '12px',
                        color: '#475569',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {type === 'image' ? <Camera size={20} /> : <Video size={20} />}
                    {t('choose_file') || 'Choose File'}
                </button>

                {previewUrl && (
                    <div
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '2px solid #10b981',
                            cursor: 'pointer',
                            position: 'relative',
                            background: '#f0fdf4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                        }}
                        onClick={() => window.open(previewUrl, '_blank')}
                        title={t('click_to_preview') || 'Click to preview'}
                    >
                        {type === 'image' ? (
                            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <Video size={20} color="#059669" />
                                <Check size={12} color="#059669" strokeWidth={3} />
                            </div>
                        )}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: '#10b981',
                            color: 'white',
                            fontSize: '0.6rem',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            padding: '2px 0'
                        }}>
                            {t('ready') || 'READY'}
                        </div>
                    </div>
                )}
            </div>
            {previewUrl && type === 'video' && (
                <p style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Check size={14} /> {t('video_attached_msg') || 'Video attached successfully! It will upload when you submit the form.'}
                </p>
            )}

            {/* Hidden Input for Native Behavior */}
            <input
                id={id}
                ref={fileInputRef}
                type="file"
                accept={type === 'image' ? "image/*,application/pdf" : "video/*"}
                capture={getCaptureAttribute()}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {/* Selection Overlay */}
            {showOptions && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    zIndex: 2500,
                    display: 'flex',
                    alignItems: 'center', // Center on desktop
                    justifyContent: 'center',
                    padding: '20px'
                }} onClick={() => setShowOptions(false)}>
                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            width: '100%',
                            maxWidth: '450px',
                            borderRadius: '32px',
                            padding: '40px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            animation: 'modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            textAlign: 'center'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '35px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, var(--primary), #6366f1)',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                color: 'white',
                                boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)'
                            }}>
                                {type === 'image' ? <Camera size={40} /> : <Video size={40} />}
                            </div>
                            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', fontWeight: '800' }}>
                                {type === 'image' ? t('photo_options') || 'Capture Image' : t('video_options') || 'Record Video'}
                            </h2>
                            <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1rem' }}>
                                {t('choose_how_to_proceed') || 'Choose how you want to provide your media'}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <button
                                type="button"
                                onClick={handleTakeMedia}
                                className="premium-button"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '15px',
                                    padding: '20px',
                                    background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '20px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}
                            >
                                <Camera size={24} />
                                {type === 'image' ? t('take_photo') : t('take_video')}
                            </button>

                            <button
                                type="button"
                                onClick={handleUploadFromFile}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '15px',
                                    padding: '20px',
                                    background: '#f8fafc',
                                    color: '#0f172a',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '20px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Upload size={24} color="var(--primary)" />
                                {type === 'image' ? t('upload_gallery') : t('upload_file')}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowOptions(false)}
                                style={{
                                    marginTop: '10px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Capture Components */}
            {showCamera && (
                <CameraCapture
                    onCapture={handleCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}

            {showVideoRecorder && (
                <VideoRecorder
                    onCapture={handleCapture}
                    onClose={() => setShowVideoRecorder(false)}
                />
            )}

            <style>{`
                @keyframes modalPop {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .premium-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
                }
                .premium-button:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

export default MediaUploader;
