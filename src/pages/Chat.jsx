import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { assets } from '../assets/assets';
import { authClient } from '../api/auth';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Chat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { docId } = useParams();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get authenticated session from Better Auth
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const token = session?.session?.token;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('register_user', userId);
    });

    socketRef.current.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Fetch chats
    fetchChats();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, userId, isPending, navigate]);

  useEffect(() => {
    if (activeChat && socketRef.current) {
      socketRef.current.emit('join_chat', activeChat.id || activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fetchChats = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/chat/user-chats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setChats(data.chats);
        // Auto-open chat if docId param matches
        if (docId && docId !== 'all') {
          const currentChat = data.chats.find(c => c.docId === docId || c.doctor?.id === docId);
          if (currentChat) {
            setActiveChat(currentChat);
          } else {
            // No existing chat — create one via the API
            try {
              const createRes = await fetch(`${SOCKET_URL}/api/chat/get-chat`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ doctorId: docId })
              });
              const createData = await createRes.json();
              if (createData.success && createData.chat) {
                setActiveChat(createData.chat);
                setChats(prev => {
                  const exists = prev.find(c => c.id === createData.chat.id);
                  return exists ? prev : [createData.chat, ...prev];
                });
                // Fetch messages for the newly created chat
                openChat(createData.chat);
              }
            } catch (err) {
              console.error('Failed to create chat:', err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (chat) => {
    setActiveChat(chat);
    const chatId = chat.id || chat._id;
    socketRef.current?.emit('join_chat', chatId);

    try {
      const response = await fetch(`${SOCKET_URL}/api/chat/messages/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() && !image) return;
    if (!activeChat) return;

    setSending(true);
    const formData = new FormData();
    formData.append('chatId', activeChat.id || activeChat._id);
    formData.append('senderId', userId);
    formData.append('senderType', 'USER');
    formData.append('content', messageText);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch(`${SOCKET_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setMessageText('');
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async () => {
    if (!activeChat) return;
    if (!window.confirm(t('chat.deleteConfirm'))) return;

    try {
      const response = await fetch(`${SOCKET_URL}/api/chat/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatId: activeChat.id || activeChat._id })
      });
      const data = await response.json();
      if (data.success) {
        setActiveChat(null);
        setMessages([]);
        fetchChats();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDoctorName = (chat) => {
    const doc = chat.doctor || chat.doctorData;
    if (!doc) return t('common.doctor');
    const firstName = doc.firstName || doc.name?.split(' ')[0] || '';
    const lastName = doc.lastName || doc.name?.split(' ').slice(1).join(' ') || '';
    return `${firstName} ${lastName}`.trim() || t('common.doctor');
  };

  const getDoctorImage = (chat) => {
    const doc = chat.doctor || chat.doctorData;
    return doc?.image || assets?.doc_icon || '/default-avatar.png';
  };

  const getDoctorSpecialty = (chat) => {
    const doc = chat.doctor || chat.doctorData;
    return doc?.specialization || doc?.speciality || '';
  };

  const getMessageSender = (msg) => msg.senderType === 'USER' || msg.senderType === 'user';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/30 border-t-primary"></div>
          <p className="text-sm text-text-muted">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Chat List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-display font-bold text-text">{t('chat.messages')}</h2>
          <p className="text-sm text-text-muted">{t('chat.chatWithDoctors')}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-surface-raised rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <p className="text-text-secondary font-semibold text-sm">{t('chat.noConversations')}</p>
              <p className="text-text-muted text-xs mt-1">{t('chat.startChatFromProfile')}</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id || chat._id}
                onClick={() => openChat(chat)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 hover:bg-primary/5 border-b border-border ${
                  activeChat?.id === chat.id || activeChat?._id === chat._id ? 'bg-primary/[0.07] shadow-sm' : ''
                }`}
              >
                <img
                  src={getDoctorImage(chat)}
                  alt={getDoctorName(chat)}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text text-sm truncate">
                    {getDoctorName(chat)}
                  </h3>
                  <p className="text-xs text-text-muted truncate">{getDoctorSpecialty(chat)}</p>
                  {chat.lastMessage && (
                    <p className="text-xs text-text-muted/60 truncate mt-1">{chat.lastMessage}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center bg-surface">
            <div className="text-center px-6">
              <div className="w-24 h-24 mx-auto mb-5 bg-surface-raised rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <h3 className="text-base font-display font-semibold text-text-muted">{t('chat.selectConversation')}</h3>
              <p className="text-sm text-text-muted/60 mt-1">{t('chat.chooseChatPrompt')}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-white">
              <button
                onClick={() => setActiveChat(null)}
                className="md:hidden p-1.5 hover:bg-surface-raised rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <img
                src={getDoctorImage(activeChat)}
                alt={getDoctorName(activeChat)}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text text-sm truncate">
                  {getDoctorName(activeChat)}
                </h3>
                <p className="text-xs text-green-600 font-medium">{t('chat.online')}</p>
              </div>
              <button
                onClick={deleteConversation}
                className="p-2 text-text-muted hover:text-rose transition-colors rounded-lg hover:bg-rose-light"
                title={t('chat.deleteConversation')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={messagesEndRef} className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 bg-surface">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-text-muted text-sm">{t('chat.noMessagesYet')}</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg._id || msg.id || idx} className={`flex ${getMessageSender(msg) ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] ${getMessageSender(msg) ? 'animate-fade-in-up' : 'animate-fade-in-up'}`} style={{ animationDelay: `${idx * 30}ms` }}>
                      <div className={`p-3.5 rounded-2xl shadow-sm ${
                        getMessageSender(msg)
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white text-text rounded-bl-sm border border-border-light'
                      }`}>
                        {msg.image && (
                          <div className="mb-2 overflow-hidden rounded-xl">
                            <img
                              src={msg.image}
                              alt=""
                              className="max-w-full h-auto cursor-pointer hover:scale-[1.02] transition-transform duration-300 rounded-xl"
                              onClick={() => window.open(msg.image, '_blank')}
                            />
                          </div>
                        )}
                        {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                        <p className={`text-[10px] mt-1.5 text-right opacity-60`}>
                          {formatTime(msg.createdAt || msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-border flex gap-3 items-center">
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-text-muted hover:text-primary transition-colors rounded-xl hover:bg-surface-raised"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94a3 3 0 114.243 4.243L8.767 17.45a1.5 1.5 0 01-2.121-2.121l10.191-10.191" />
                </svg>
              </button>
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                placeholder={t('chat.typeMessage')}
                className="flex-1 border-none bg-surface rounded-full px-5 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm placeholder:text-text-muted/60"
              />
              <button
                disabled={sending || (!messageText.trim() && !image)}
                onClick={sendMessage}
                className="bg-primary text-white p-2.5 rounded-full hover:bg-primary-dark active:scale-95 transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
