import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const startCamera = async () => {
        setLoading(true);
        setError(null);
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please ensure you have given permission.");
        } finally {
            setLoading(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas size to video size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to data URL for preview
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setCapturedImage(dataUrl);

            // Stop camera stream after capture
            stopCamera();
        }
    };

    const handleConfirm = () => {
        if (capturedImage) {
            // Convert dataUrl to a File object
            fetch(capturedImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "profile_photo.jpg", { type: "image/jpeg" });
                    onCapture(file, capturedImage);
                });
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '20px'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '32px',
                width: '100%',
                maxWidth: '600px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                animation: 'modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div style={{ padding: '25px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800' }}>Capture Photo</h3>
                    <button type="button" onClick={onClose} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '12px' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ position: 'relative', background: '#000', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {loading && <div style={{ color: 'white' }}>Starting camera...</div>}
                    {error && <div style={{ color: '#ff4444', padding: '20px', textAlign: 'center' }}>{error}</div>}

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: capturedImage || error || loading ? 'none' : 'block',
                            transform: 'scaleX(-1)' // Mirror effect for user camera
                        }}
                    />

                    {capturedImage && (
                        <img
                            src={capturedImage}
                            alt="Captured"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                        />
                    )}

                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                <div style={{ padding: '30px', display: 'flex', gap: '15px', justifyContent: 'center', background: '#f8fafc' }}>
                    {!capturedImage ? (
                        <button
                            type="button"
                            onClick={capturePhoto}
                            disabled={!stream || loading}
                            style={{
                                background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                                color: 'white',
                                border: 'none',
                                padding: '16px 32px',
                                borderRadius: '20px',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                opacity: !stream || loading ? 0.6 : 1,
                                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)'
                            }}
                        >
                            <Camera size={22} /> Take Photo
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleRetake}
                                style={{
                                    background: '#ffffff',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    padding: '16px 28px',
                                    borderRadius: '20px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <RefreshCw size={22} /> Retake
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '16px 28px',
                                    borderRadius: '20px',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)'
                                }}
                            >
                                <Check size={22} /> Confirm Photo
                            </button>
                        </>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes modalPop {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default CameraCapture;
