import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const UniversalUploader = ({ targetContext = 'image' /* 'image' | 'video' */, onFileReady }) => {
    const { t } = useTranslation();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const [isRecording, setIsRecording] = useState(false);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    // Desktop WebRTC Logic
    const startDesktopCapture = async () => {
        try {
            const constraints = targetContext === 'video' ? { video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } }, audio: true } : { video: true };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoRef.current.srcObject = stream;

            if (targetContext === 'video') {
                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
                mediaRecorderRef.current.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data);
                };
                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                    onFileReady(blob);
                    chunksRef.current = []; // Reset streams
                };
            }
        } catch (err) {
            console.error(t('camera_access_denied'), err);
            alert(t('camera_fallback_warning') || 'Camera access denied. Please allow camera permissions.');
        }
    };

    const handleWebRTCCapture = () => {
        if (targetContext === 'image') {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
            canvas.toBlob((blob) => onFileReady(blob), 'image/jpeg', 0.9);
        } else {
            if (isRecording) {
                mediaRecorderRef.current.stop();
                const tracks = videoRef.current.srcObject?.getTracks();
                tracks?.forEach(track => track.stop()); // Stop the camera
            } else {
                mediaRecorderRef.current.start();
            }
            setIsRecording(!isRecording);
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 1200; // Max dimension
                    
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    }, 'image/jpeg', 0.85); // 85% quality
                };
            };
        });
    };

    const handleStandardUpload = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (targetContext === 'image' && file.type.startsWith('image/')) {
                const compressed = await compressImage(file);
                onFileReady(compressed);
            } else {
                onFileReady(file);
            }
        }
    };

    return (
        <div className="uploader-container p-4 border rounded-xl flex flex-col items-center gap-4 w-full">
            {isMobile ? (
                // Mobile / Tablet / Palmtop - Native HTML5 Context Hooks
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    <label className="btn-primary" style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', borderRadius: '8px' }}>
                        {targetContext === 'image' ? t('capture_id_photo') || 'Take Photo' : t('record_resume_video') || 'Record Video'}
                        <input
                            type="file"
                            accept={targetContext === 'image' ? 'image/*' : 'video/*'}
                            capture={targetContext === 'image' ? 'environment' : 'user'} // Smart facing logic
                            style={{ display: 'none' }}
                            onChange={handleStandardUpload}
                        />
                    </label>
                    <span style={{ fontSize: '0.85rem', color: '#999', textAlign: 'center' }}>{t('or') || 'or'}</span>
                    <label className="btn-secondary" style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc' }}>
                        {t('upload_from_gallery') || 'Upload from Gallery'}
                        <input
                            type="file"
                            accept={targetContext === 'image' ? 'image/*' : 'video/*'}
                            style={{ display: 'none' }}
                            onChange={handleStandardUpload}
                        />
                    </label>
                </div>
            ) : (
                // Desktop / Laptop - WebRTC Implementation
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    {!videoRef.current?.srcObject ? (
                        <button onClick={startDesktopCapture} className="btn-primary" style={{ padding: '12px', marginBottom: '16px', width: '100%', borderRadius: '8px' }}>
                            {t('enable_camera') || 'Enable Camera'}
                        </button>
                    ) : (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <video ref={videoRef} autoPlay muted style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', border: '2px solid var(--primary)', marginBottom: '16px' }} />

                            <button
                                onClick={handleWebRTCCapture}
                                className={`btn-${isRecording ? 'danger' : 'primary'}`}
                                style={{ padding: '12px', width: '100%', borderRadius: '8px', background: isRecording ? '#dc3545' : 'var(--primary)', color: 'white', border: 'none' }}
                            >
                                {targetContext === 'image'
                                    ? t('take_snapshot') || 'Take Snapshot'
                                    : (isRecording ? t('stop_recording') || 'Stop Recording' : t('start_recording') || 'Start Recording')}
                            </button>
                        </div>
                    )}

                    <div style={{ margin: '16px 0', fontSize: '0.85rem', color: '#999' }}>{t('or') || 'or'}</div>

                    {/* Universal Fallback */}
                    <label className="btn-secondary" style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', width: '100%', borderRadius: '8px', border: '1px solid #ccc' }}>
                        {t('upload_from_computer') || 'Upload from Computer'}
                        <input
                            type="file"
                            accept={targetContext === 'image' ? 'image/*' : 'video/*'}
                            style={{ display: 'none' }}
                            onChange={handleStandardUpload}
                        />
                    </label>
                </div>
            )}
        </div>
    );
};
