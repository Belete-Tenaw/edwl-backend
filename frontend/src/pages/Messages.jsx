import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/authService';
import { Send, User, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Messages = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const currentUser = authService.getCurrentUser();
    const scrollRef = useRef(null);

    // Fetch all messages and group them by user to form "conversations"
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (location.state?.startChatWith) {
            handleStartChat(location.state.startChatWith, location.state.context);
        }
    }, [location.state, conversations]); // Re-run when conversations confirm loaded

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, selectedUser]);

    const handleStartChat = (targetUserId, context) => {
        // Check if conversation already exists
        const existing = conversations.find(c => c.id === targetUserId);
        if (existing) {
            setSelectedUser(existing);
            setChatHistory(existing.messages);
        } else {
            // Create temp placeholder logic for UI
            // In a real app, we might need to fetch the user's name first
            const tempConv = {
                id: targetUserId,
                messages: [],
                lastMsg: { content: t('start_conversation'), timestamp: new Date() }
            };
            setSelectedUser(tempConv);
            setChatHistory([]);
            if (context && !newMessage) setNewMessage(context + " - ");
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get('/messages');
            const allMsgs = res.data;

            // Group by user
            const grouped = {};
            allMsgs.forEach(msg => {
                // Determine the "other" person in the chat
                const isSender = (currentUser.role === 'JOB_SEEKER' && msg.senderJSId === currentUser.id) ||
                    (currentUser.role === 'EMPLOYER' && msg.senderEmpId === currentUser.id);

                let otherUserId;

                if (isSender) {
                    if (msg.receiverJSId) { otherUserId = msg.receiverJSId; }
                    else { otherUserId = msg.receiverEmpId; }
                } else {
                    if (msg.senderJSId) { otherUserId = msg.senderJSId; }
                    else { otherUserId = msg.senderEmpId; }
                }

                if (otherUserId) {
                    if (!grouped[otherUserId]) {
                        grouped[otherUserId] = { id: otherUserId, messages: [], lastMsg: msg };
                    }
                    grouped[otherUserId].messages.push(msg);
                    if (new Date(msg.timestamp) > new Date(grouped[otherUserId].lastMsg.timestamp)) {
                        grouped[otherUserId].lastMsg = msg;
                    }
                }
            });

            const sortedConvs = Object.values(grouped).sort((a, b) => new Date(b.lastMsg.timestamp) - new Date(a.lastMsg.timestamp));
            setConversations(sortedConvs);

            // Update active chat if selected and it exists in fetched data
            if (selectedUser) {
                // If we were in a temp start-chat mode, keep it unless we found real messages
                const updated = grouped[selectedUser.id];
                if (updated) {
                    setChatHistory(updated.messages);
                }
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (conv) => {
        setSelectedUser(conv);
        setChatHistory(conv.messages);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const receiverType = currentUser.role === 'JOB_SEEKER' ? 'EMPLOYER' : 'JOB_SEEKER';

            const payload = {
                receiverId: selectedUser.id,
                receiverType,
                content: newMessage
            };

            const res = await api.post('/messages', payload);

            // Update locally
            const newMsg = res.data;
            setChatHistory([...chatHistory, newMsg]);
            setNewMessage('');

            // Refresh list to show latest in sidebar
            fetchMessages();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send message');
        }
    };

    return (
        <div className="container" style={{ padding: '20px', height: '85vh', display: 'flex', gap: '20px' }}>
            {/* Sidebar */}
            <div className="card" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '0' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                    <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageSquare size={20} /> {t('messages')}
                    </h2>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.length === 0 && !selectedUser ? (
                        <p style={{ padding: '20px', color: '#999', textAlign: 'center' }}>{t('no_conversations')}</p>
                    ) : (
                        <>
                            {/* Show temp user if active but not in list yet */}
                            {selectedUser && !conversations.find(c => c.id === selectedUser.id) && (
                                <div
                                    style={{
                                        padding: '15px 20px',
                                        borderBottom: '1px solid #f5f5f5',
                                        cursor: 'pointer',
                                        background: '#fff0e6'
                                    }}
                                >
                                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>{t('new_chat')} ({selectedUser.id.substring(0, 8)}...)</div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{t('drafting')}</div>
                                </div>
                            )}

                            {conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    onClick={() => handleSelectUser(conv)}
                                    style={{
                                        padding: '15px 20px',
                                        borderBottom: '1px solid #f5f5f5',
                                        cursor: 'pointer',
                                        background: selectedUser?.id === conv.id ? '#fff0e6' : 'white',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>User {conv.id.substring(0, 8)}...</div>
                                    <div style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {conv.lastMsg.content}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0' }}>
                {selectedUser ? (
                    <>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', background: '#fafafa', borderRadius: '12px 12px 0 0' }}>
                            <h3 style={{ fontSize: '1.1rem' }}>Conversation with User {selectedUser.id.substring(0, 8)}...</h3>
                        </div>

                        <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {chatHistory.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>{t('start_conversation')}</div>
                            )}
                            {chatHistory.map((msg) => {
                                const isMe = (currentUser.role === 'JOB_SEEKER' && msg.senderJSId === currentUser.id) ||
                                    (currentUser.role === 'EMPLOYER' && msg.senderEmpId === currentUser.id);
                                return (
                                    <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                        <div style={{
                                            padding: '10px 15px',
                                            background: isMe ? 'var(--primary)' : '#f0f0f0',
                                            color: isMe ? 'white' : '#333',
                                            borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0'
                                        }}>
                                            {msg.content}
                                        </div>
                                        {msg.timestamp && (
                                            <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                            <input
                                style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none' }}
                                placeholder={t('type_message')}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button disabled={!newMessage.trim()} type="submit" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', flexDirection: 'column' }}>
                        <MessageSquare size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                        <p>{t('select_conversation')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
