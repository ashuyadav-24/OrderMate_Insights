import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';
import {
  Send,
  MessageSquare,
  Users,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  ShoppingBag,
  Info
} from 'lucide-react';

export const ChatRoom = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatData = async () => {
    try {
      setLoading(true);
      const res = await api.getOrderChat(orderId);
      if (res.success) {
        setOrder(res.data.order);
        setMessages(res.data.messages || []);
      } else {
        setError(res.message || 'Access denied to this chatroom');
      }
    } catch (err) {
      setError('Failed to load chatroom');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatData();
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket room setup and real-time listeners
  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit('join_order_room', { orderId });

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user_typing', ({ name }) => {
      setTypingUser(name);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 2500);
    });

    socket.on('user_stop_typing', () => {
      setTypingUser(null);
    });

    return () => {
      socket.emit('leave_order_room', { orderId });
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, orderId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');

    if (socket && isConnected) {
      socket.emit('send_message', { orderId, content });
      socket.emit('stop_typing', { orderId });
    } else {
      // Fallback to HTTP POST
      try {
        const res = await api.sendMessage(orderId, content);
        if (res.success) {
          setMessages((prev) => [...prev, res.data]);
        }
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket && isConnected) {
      socket.emit('typing', { orderId });
    }
  };

  if (loading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-xs font-semibold">
          Loading private chatroom...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Private Chatroom Access Denied</h2>
        <p className="text-xs text-slate-500">
          {error || 'You must be the order creator or an accepted participant to view this conversation.'}
        </p>
        <Link
          to="/active-orders"
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Active Orders</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Left/Main Column: Realtime Chat Area */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Link
              to="/my-orders"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">{order.platform} Coordination</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {order.orderCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Created by {order.creator?.name} (Hostel {order.creator?.hostel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                order.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'COMPLETED'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageSquare className="w-8 h-8 mb-2 stroke-1" />
              <p className="text-xs font-semibold text-slate-600">No messages yet</p>
              <p className="text-[11px] max-w-xs text-slate-400 mt-0.5">
                Coordinate items, room delivery at the gate, and UPI payment here.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div key={msg._id} className="text-center my-2">
                    <span className="inline-block py-1 px-3 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              const isMe = (msg.sender?._id || msg.sender) === user?._id;

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-600">
                      {isMe ? 'You' : msg.senderName || msg.sender?.name}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      ({msg.senderHostel || msg.sender?.hostel || 'Campus'})
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm shadow-emerald-600/20'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        {typingUser && (
          <div className="px-6 py-1 text-[11px] text-slate-400 italic bg-white">
            {typingUser} is typing...
          </div>
        )}

        {/* Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3.5 border-t border-slate-100 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type a message (e.g. Added my bread to cart, paying ₹45 via UPI)..."
            value={inputText}
            onChange={handleInputChange}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-40"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right Column: Order Information Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-5 overflow-y-auto">
        <div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">Group Order Breakdown</h3>
          <p className="text-[11px] text-slate-500">Live order status and participant commitments</p>
        </div>

        {/* Target Progress */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[11px] font-semibold text-emerald-950">Threshold Target</span>
            <span className="text-sm font-extrabold text-emerald-800">
              ₹{order.currentContributedAmount} / ₹{order.targetAmountNeeded}
            </span>
          </div>
          <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (order.currentContributedAmount / order.targetAmountNeeded) * 100)}%`
              }}
            />
          </div>
          <p className="text-[10px] text-emerald-700 mt-1">
            {order.currentContributedAmount >= order.targetAmountNeeded
              ? '🎉 Target reached! Free delivery unlocked.'
              : `Needs ₹${Math.max(0, order.targetAmountNeeded - order.currentContributedAmount)} more to unlock.`}
          </p>
        </div>

        {/* Timing Info */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600 pb-2 border-b border-slate-100">
            <span className="text-slate-400">Planned Ordering Time</span>
            <span className="font-semibold text-slate-800">{order.plannedOrderTime}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 pb-2 border-b border-slate-100">
            <span className="text-slate-400">Status</span>
            <span className="font-bold text-emerald-700">{order.status}</span>
          </div>
        </div>

        {/* Accepted Participants */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Participants ({1 + (order.acceptedParticipants?.length || 0)})</span>
          </h4>

          <div className="space-y-2">
            {/* Creator */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={order.creator?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${order.creator?.name}`}
                  alt=""
                  className="w-6 h-6 rounded-full"
                />
                <div>
                  <span className="font-semibold text-slate-800 block text-[11px]">
                    {order.creator?.name} (Creator)
                  </span>
                  <span className="text-[10px] text-slate-400">Hostel {order.creator?.hostel}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Host
              </span>
            </div>

            {/* Accepted Joiners */}
            {order.acceptedParticipants?.map((p, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={p.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.user?.name}`}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">
                      {p.user?.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Hostel {p.user?.hostel} • {p.items}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  ₹{p.expectedAmount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Handover Tips */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1 font-bold text-slate-700">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivery & Handover Tip</span>
          </div>
          <p>
            Once the rider arrives at the hostel gate, the creator picks up the parcel and coordinates handing over individual packets.
          </p>
        </div>
      </div>
    </div>
  );
};
