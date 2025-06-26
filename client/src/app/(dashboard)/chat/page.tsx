'use client';

import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

// Define types for our data structures
interface Conversation {
  conversation_id: number;
  other_user_id: number;
  other_user_first_name: string;
  other_user_last_name: string;
}
interface Message {
  message_id: number;
  sender_id: number;
  content: string;
  sent_at: string;
}
interface Professional {
  user_id: number;
  first_name: string;
  last_name: string;
}
interface Patient {
  user_id: number;
  first_name: string;
  last_name: string;
}
interface Group {
  group_id: number;
  name: string;
  creator_id: number;
  created_at: string;
}
interface GroupMessage {
  message_id: number;
  group_id: number;
  sender_id: number;
  content: string;
  sent_at: string;
}

export default function ChatPage() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConv, setShowNewConv] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [newConvError, setNewConvError] = useState('');
  const [newConvSuccess, setNewConvSuccess] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [pinned, setPinned] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pinnedConversations');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [unread, setUnread] = useState<{ [key: number]: number }>({});
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number|null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [groupMessage, setGroupMessage] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState<number[]>([]);
  const [groupCreateError, setGroupCreateError] = useState('');
  const [groupCreateSuccess, setGroupCreateSuccess] = useState('');
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Effect to setup and teardown socket connection
  useEffect(() => {
    if (token) {
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001', {
        auth: { token }
      });
      socketRef.current = newSocket;

      newSocket.on('connect', () => console.log('Socket connected!'));
      newSocket.on('disconnect', () => console.log('Socket disconnected.'));
      newSocket.on('chatError', (error) => alert(`Chat Error: ${error.message}`));
      newSocket.on('receiveMessage', (message: Message) => {
        // Only update messages if the received message belongs to the selected conversation
        if (message.sender_id === selectedConversation?.other_user_id || message.sender_id === Number(user?.id)) {
           setMessages(prevMessages => [...prevMessages, message]);
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, user]);

  // Effect to fetch conversations
  useEffect(() => {
    api.get('/chat/conversations')
      .then(response => setConversations(response.data))
      .catch(err => console.error("Failed to fetch conversations:", err));
  }, []);

  // Effect to scroll to the bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Charger la liste des professionnels pour les patients
  useEffect(() => {
    if (user?.role === 'patient') {
      api.get('/patients/professionals')
        .then(res => setProfessionals(res.data))
        .catch(() => setProfessionals([]));
    }
  }, [user]);

  // Charger la liste des patients pour les professionnels
  useEffect(() => {
    if (user?.role === 'professional') {
      api.get('/patients')
        .then(res => setPatients(res.data))
        .catch(() => setPatients([]));
    }
  }, [user]);

  // Socket.io : écoute des nouveaux messages pour notifications
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleNewMessage = (data: { conversation_id: number }) => {
      if (data.conversation_id !== selectedConversation?.conversation_id) {
        setUnread(prev => ({ ...prev, [data.conversation_id]: (prev[data.conversation_id] || 0) + 1 }));
      }
    };
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [selectedConversation]);

  // Écouter la liste des utilisateurs en ligne
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleOnlineUsers = (users: number[]) => {
      setOnlineUsers(users);
    };
    socket.on('onlineUsers', handleOnlineUsers);
    return () => {
      socket.off('onlineUsers', handleOnlineUsers);
    };
  }, []);

  // Charger les groupes de l'utilisateur
  useEffect(() => {
    api.get('/chat/groups').then(res => setGroups(res.data)).catch(() => setGroups([]));
  }, []);

  // Charger les messages du groupe sélectionné
  useEffect(() => {
    if (selectedGroupId) {
      api.get(`/chat/groups/${selectedGroupId}/messages`).then(res => setGroupMessages(res.data)).catch(() => setGroupMessages([]));
    }
  }, [selectedGroupId]);

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    api.get(`/chat/conversations/${conversation.conversation_id}`)
      .then(response => setMessages(response.data))
      .catch(err => console.error("Failed to fetch messages:", err));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation && socketRef.current) {
      socketRef.current.emit('sendMessage', {
        receiverId: selectedConversation.other_user_id,
        content: newMessage,
      });
      setNewMessage('');
    }
  };

  // Démarrer une nouvelle conversation
  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewConvError('');
    setNewConvSuccess('');
    if (!selectedProfessional) {
      setNewConvError('Veuillez sélectionner un professionnel.');
      return;
    }
    try {
      await api.post('/chat/conversations', { recipientId: selectedProfessional });
      setNewConvSuccess('Conversation démarrée !');
      setShowNewConv(false);
      setSelectedProfessional('');
      // Rafraîchir la liste des conversations
      const response = await api.get('/chat/conversations');
      setConversations(response.data);
    } catch (err: any) {
      setNewConvError(err.response?.data?.msg || "Erreur lors de la création de la conversation.");
    }
  };

  // Gérer l'épinglage/désépinglage
  const togglePin = (id: number) => {
    let newPinned;
    if (pinned.includes(id)) {
      newPinned = pinned.filter(pid => pid !== id);
    } else {
      newPinned = [...pinned, id];
    }
    setPinned(newPinned);
    localStorage.setItem('pinnedConversations', JSON.stringify(newPinned));
  };

  const handleArchive = async (conversationId: number) => {
    if (!window.confirm('Archiver cette conversation ?')) return;
    try {
      await api.patch(`/chat/conversations/${conversationId}/archive`);
      setConversations(convs => convs.filter(c => c.conversation_id !== conversationId));
      if (selectedConversation?.conversation_id === conversationId) setSelectedConversation(null);
    } catch {
      alert('Erreur lors de l\'archivage.');
    }
  };

  // Créer un groupe
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupCreateError('');
    setGroupCreateSuccess('');
    try {
      const res = await api.post('/chat/groups', { name: groupName, memberIds: groupMembers });
      setGroupCreateSuccess('Groupe créé !');
      setShowCreateGroup(false);
      setGroupName('');
      setGroupMembers([]);
      // Rafraîchir la liste
      const groupsRes = await api.get('/chat/groups');
      setGroups(groupsRes.data);
    } catch {
      setGroupCreateError('Erreur lors de la création du groupe.');
    }
  };

  // Envoyer un message de groupe
  const handleSendGroupMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupMessage.trim() || !selectedGroupId) return;
    try {
      await api.post(`/chat/groups/${selectedGroupId}/messages`, { content: groupMessage });
      setGroupMessage('');
      // Rafraîchir
      const res = await api.get(`/chat/groups/${selectedGroupId}/messages`);
      setGroupMessages(res.data);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-2 sm:px-8">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-700 drop-shadow flex items-center gap-3">
        <span className="inline-block bg-blue-100 rounded-full p-2 shadow">
          <Image src="/file.svg" alt="Logo Messagerie" width={48} height={48} />
        </span>
        Messagerie
      </h1>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-gray-200 bg-white">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold">Conversations</h2>
            {(user?.role === 'patient' || user?.role === 'professional') && (
              <button onClick={() => setShowNewConv(v => !v)} className="ml-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Démarrer une conversation</button>
            )}
            <button onClick={() => setShowCreateGroup(v => !v)} className="ml-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Créer un groupe</button>
          </div>
          {/* Champ de recherche */}
          <div className="p-4 border-b bg-gray-50">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="w-full p-2 border rounded-md"
            />
          </div>
          {/* Liste des groupes */}
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold mb-2">Groupes</h3>
            <ul>
              {groups.map(group => (
                <li key={group.group_id} className={`p-2 cursor-pointer hover:bg-green-50 ${selectedGroupId === group.group_id ? 'bg-green-100' : ''}`}
                    onClick={() => { setSelectedGroupId(group.group_id); setSelectedConversation(null); }}>
                  <span className="font-bold">{group.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul>
            {/* Conversations épinglées */}
            {conversations
              .filter(conv => pinned.includes(conv.conversation_id))
              .filter(conv =>
                `${conv.other_user_first_name} ${conv.other_user_last_name}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map(conv => (
                <li key={conv.conversation_id} className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedConversation?.conversation_id === conv.conversation_id ? 'bg-blue-100' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {/* Indicateur présence */}
                      <span className={`inline-block w-2 h-2 rounded-full ${onlineUsers.includes(
                        user?.role === 'patient' ? conv.other_user_id : conv.other_user_id
                      ) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <p className="font-semibold" onClick={() => selectConversation(conv)}>{conv.other_user_first_name} {conv.other_user_last_name}</p>
                      {/* Bouton archive */}
                      <button
                        className="ml-2 text-gray-400 hover:text-red-500"
                        title="Archiver la conversation"
                        onClick={e => { e.stopPropagation(); handleArchive(conv.conversation_id); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </span>
                    <button onClick={e => { e.stopPropagation(); togglePin(conv.conversation_id); }} title="Désépingler" className="ml-2 text-yellow-500">★</button>
                  </div>
                </li>
              ))}
            {/* Conversations non épinglées */}
            {conversations
              .filter(conv => !pinned.includes(conv.conversation_id))
              .filter(conv =>
                `${conv.other_user_first_name} ${conv.other_user_last_name}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map(conv => (
                <li key={conv.conversation_id} className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedConversation?.conversation_id === conv.conversation_id ? 'bg-blue-100' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {/* Indicateur présence */}
                      <span className={`inline-block w-2 h-2 rounded-full ${onlineUsers.includes(
                        user?.role === 'patient' ? conv.other_user_id : conv.other_user_id
                      ) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <p className="font-semibold" onClick={() => selectConversation(conv)}>{conv.other_user_first_name} {conv.other_user_last_name}</p>
                      {/* Bouton archive */}
                      <button
                        className="ml-2 text-gray-400 hover:text-red-500"
                        title="Archiver la conversation"
                        onClick={e => { e.stopPropagation(); handleArchive(conv.conversation_id); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </span>
                    <button onClick={e => { e.stopPropagation(); togglePin(conv.conversation_id); }} title="Épingler" className="ml-2 text-gray-400 hover:text-yellow-500">☆</button>
                  </div>
                </li>
              ))}
          </ul>
          {/* Formulaire nouvelle conversation pour patient */}
          {showNewConv && user?.role === 'patient' && (
            <form onSubmit={handleStartConversation} className="p-4 border-b space-y-2 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700">Sélectionner un professionnel</label>
              <select value={selectedProfessional} onChange={e => setSelectedProfessional(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="">-- Choisir un professionnel --</option>
                {professionals.map(pro => (
                  <option key={pro.user_id} value={pro.user_id}>Dr. {pro.first_name} {pro.last_name}</option>
                ))}
              </select>
              <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Démarrer</button>
              {newConvSuccess && <p className="text-green-600 text-sm mt-1">{newConvSuccess}</p>}
              {newConvError && <p className="text-red-500 text-sm mt-1">{newConvError}</p>}
            </form>
          )}
          {/* Formulaire nouvelle conversation pour professionnel */}
          {showNewConv && user?.role === 'professional' && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setNewConvError('');
              setNewConvSuccess('');
              if (!selectedProfessional) {
                setNewConvError('Veuillez sélectionner un patient.');
                return;
              }
              try {
                await api.post('/chat/conversations', { recipientId: selectedProfessional });
                setNewConvSuccess('Conversation démarrée !');
                setShowNewConv(false);
                setSelectedProfessional('');
                const response = await api.get('/chat/conversations');
                setConversations(response.data);
              } catch (err: any) {
                setNewConvError(err.response?.data?.msg || "Erreur lors de la création de la conversation.");
              }
            }} className="p-4 border-b space-y-2 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700">Sélectionner un patient</label>
              <select value={selectedProfessional} onChange={e => setSelectedProfessional(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="">-- Choisir un patient --</option>
                {patients.map(pat => (
                  <option key={pat.user_id} value={pat.user_id}>{pat.first_name} {pat.last_name}</option>
                ))}
              </select>
              <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Démarrer</button>
              {newConvSuccess && <p className="text-green-600 text-sm mt-1">{newConvSuccess}</p>}
              {newConvError && <p className="text-red-500 text-sm mt-1">{newConvError}</p>}
            </form>
          )}
          {/* Modal création de groupe */}
          {showCreateGroup && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <form className="bg-white p-6 rounded shadow w-96" onSubmit={handleCreateGroup}>
                <h2 className="text-lg font-bold mb-4">Créer un groupe</h2>
                <input type="text" className="w-full border p-2 mb-2" placeholder="Nom du groupe" value={groupName} onChange={e => setGroupName(e.target.value)} required />
                <div className="mb-2">
                  <label className="block mb-1">Membres :</label>
                  <select multiple className="w-full border p-2" value={groupMembers.map(String)} onChange={e => setGroupMembers(Array.from(e.target.selectedOptions, o => Number(o.value)))}>
                    {/* Patients et professionnels */}
                    {patients.map(p => <option key={p.user_id} value={p.user_id}>{p.first_name} {p.last_name} (Patient)</option>)}
                    {professionals.map(pr => <option key={pr.user_id} value={pr.user_id}>{pr.first_name} {pr.last_name} (Pro)</option>)}
                  </select>
                </div>
                {groupCreateError && <p className="text-red-500 mb-2">{groupCreateError}</p>}
                {groupCreateSuccess && <p className="text-green-600 mb-2">{groupCreateSuccess}</p>}
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => setShowCreateGroup(false)}>Annuler</button>
                  <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Créer</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Message Area */}
        <div className="w-2/3 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b bg-white shadow-sm">
                <h2 className="text-xl font-bold">
                  {selectedConversation.other_user_first_name} {selectedConversation.other_user_last_name}
                </h2>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.message_id} className={`flex ${msg.sender_id === Number(user?.id) ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md p-3 rounded-lg my-1 ${msg.sender_id === Number(user?.id) ? 'bg-blue-500 text-white' : 'bg-white'}`}>
                      <p>{msg.content}</p>
                       <p className={`text-xs mt-1 ${msg.sender_id === Number(user?.id) ? 'text-blue-200' : 'text-gray-500'}`}>
                          {new Date(msg.sent_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                 <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-white border-t">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">
                    Envoyer
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Sélectionnez une conversation pour commencer à discuter.</p>
            </div>
          )}
          {/* Affichage des messages de groupe */}
          {selectedGroupId && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4">
                {groupMessages.map(msg => (
                  <div key={msg.message_id} className={`mb-2 ${msg.sender_id === Number(user?.id) ? 'text-right' : 'text-left'}`}>
                    <span className="inline-block px-3 py-1 rounded bg-gray-100">{msg.content}</span>
                    <div className="text-xs text-gray-400">{msg.sent_at}</div>
                  </div>
                ))}
              </div>
              <form className="p-4 border-t flex gap-2" onSubmit={handleSendGroupMessage}>
                <input type="text" className="flex-1 border p-2 rounded" placeholder="Votre message..." value={groupMessage} onChange={e => setGroupMessage(e.target.value)} />
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Envoyer</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 