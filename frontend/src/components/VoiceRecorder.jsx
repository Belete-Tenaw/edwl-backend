import React, { useState, useRef } from 'react';
import { Mic, Square, Trash2, Play, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const VoiceRecorder = ({ onComplete }) => {
    const { t } = useTranslation();
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [transcription, setTranscription] = useState('');
    
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access denied:", err);
            alert(t('mic_access_denied', 'Please enable microphone access to record your voice bio.'));
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks to release the microphone
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleUpload = async () => {
        if (!audioBlob) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('voiceBio', audioBlob, 'voice_bio.webm');

            // 1. Upload the file
            const uploadRes = await api.post('/upload/voice-bio', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const voiceUrl = uploadRes.data.voiceUrl;
            
            // 2. Trigger AI Processing (Transcription & Skill Extraction)
            setProcessing(true);
            const user = JSON.parse(localStorage.getItem('user'));
            const aiRes = await api.post('/ai/voice/process', {
                userId: user.id,
                audioUrl: voiceUrl,
                language: localStorage.getItem('i18nextLng') || 'am'
            });

            setTranscription(aiRes.data.transcription);
            alert(t('voice_bio_success', 'Voice bio uploaded and transcribed successfully!'));
            
            if (onComplete) onComplete(aiRes.data);
        } catch (err) {
            console.error("Upload error:", err);
            alert(t('voice_upload_failed', 'Failed to upload or process voice bio.'));
        } finally {
            setUploading(false);
            setProcessing(false);
        }
    };

    const reset = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setTranscription('');
    };

    return (
        <div className="voice-recorder-container" style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            border: '2px dashed #cbd5e1',
            marginTop: '15px'
        }}>
            <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mic size={20} className="text-primary" /> {t('voice_bio_record', 'Record Voice Bio')}
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>
                {t('voice_bio_hint', 'Speak in your native language about your experience. Our AI will transcribe it and update your profile.')}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {!audioUrl ? (
                    !isRecording ? (
                        <button type="button" onClick={startRecording} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                            <Mic size={18} /> {t('start_recording', 'Start Recording')}
                        </button>
                    ) : (
                        <button type="button" onClick={stopRecording} className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', animation: 'pulse 1.5s infinite' }}>
                            <Square size={18} /> {t('stop_recording', 'Stop Recording')}
                        </button>
                    )
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                        <audio src={audioUrl} controls style={{ height: '35px' }} />
                        <button type="button" onClick={reset} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px' }}>
                            <Trash2 size={16} /> {t('delete', 'Delete')}
                        </button>
                        <button type="button" onClick={handleUpload} disabled={uploading || processing} className="btn-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px' }}>
                            {(uploading || processing) ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                            {uploading ? t('uploading', 'Uploading...') : processing ? t('processing', 'AI Analyzing...') : t('save_voice_bio', 'Save & Process')}
                        </button>
                    </div>
                )}
            </div>

            {transcription && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#065f46', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CheckCircle size={14} /> {t('ai_transcription', 'AI Transcription:')}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#064e3b', fontStyle: 'italic' }}>"{transcription}"</p>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default VoiceRecorder;
