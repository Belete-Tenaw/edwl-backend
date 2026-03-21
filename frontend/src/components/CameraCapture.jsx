import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CameraCapture = ({ onCapture, onClose }) => {
    const { t } = useTranslation();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' }, 
                audio: false 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError(t('camera_access_denied') || "Camera access denied. Please allow camera permissions.");
        }
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage({ blob, url: imageUrl });
        }, 'image/jpeg', 0.8);
    };

    const handleConfirm = () => {
        if (capturedImage) {
            onCapture(capturedImage.blob);
            onClose();
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setError(null);
        startCamera();
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div className="card" style={{ width: '90%', maxWidth: '500px', textAlign: 'center', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>{t('take_live_selfie') || 'Take Live Selfie'}</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#666" />
                    </button>
                </div>

                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                    {error ? (
                        <div style={{ padding: '40px', color: 'white' }}>{error}</div>
                    ) : capturedImage ? (
                        <img src={capturedImage.url} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {!capturedImage ? (
                        <button className="btn-primary" onClick={takePhoto} disabled={!!error} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                            <Camera size={20} /> {t('capture') || 'Capture'}
                        </button>
                    ) : (
                        <>
                            <button onClick={handleRetake} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <RefreshCw size={20} /> {t('retake') || 'Retake'}
                            </button>
                            <button className="btn-primary" onClick={handleConfirm} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                                <Check size={20} /> {t('confirm') || 'Confirm'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraCapture;
