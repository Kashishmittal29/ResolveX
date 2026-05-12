import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onSnapshot, query, collection, where, orderBy, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [usingFirebase, setUsingFirebase] = useState(false);

  const fetchNotificationsFromAPI = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
      setUsingFirebase(false);
    } catch {
      // Silently fail - notifications not critical
    }
  };

  useEffect(() => {
    if (!user) return;

    // Try Firebase real-time first
    if (db) {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', user.id),
          where('read', '==', false),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const notifs = snapshot.docs.map((doc) => ({
              _id: doc.id,
              ...doc.data(),
            }));
            setNotifications(notifs);
            setUnreadCount(notifs.length);
            setUsingFirebase(true);
            console.log('✅ Real-time Firestore notifications active');
          },
          (error) => {
            console.warn('⚠️  Firebase listener error:', error.message);
            setUsingFirebase(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.warn('⚠️  Firebase setup failed:', error.message);
        setUsingFirebase(false);
      }
    }

    // Fallback: API polling — fetch immediately then every 30s
    fetchNotificationsFromAPI();
    const interval = setInterval(fetchNotificationsFromAPI, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markRead = async (id) => {
    try {
      if (usingFirebase && db) {
        // Update in Firestore
        const notifRef = doc(db, 'notifications', id);
        await updateDoc(notifRef, { read: true });
      } else {
        // Update via API
        await api.patch(`/notifications/${id}/read`);
      }
      // UI will update automatically via listener or next poll
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      if (usingFirebase && db) {
        // Use getDocs to fetch once, then update each doc
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', user.id),
          where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        await Promise.all(snapshot.docs.map(docSnap => updateDoc(docSnap.ref, { read: true })));
      } else {
        // Update via API
        await api.patch('/notifications/read-all');
      }
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-gray-100 relative"
        title={usingFirebase ? '🔄 Real-time updates active' : 'Notifications'}
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lg border z-50">
            <div className="p-3 border-b flex justify-between items-center bg-gradient-to-r from-primary-50 to-white">
              <span className="font-medium">Notifications</span>
              <div className="flex items-center gap-2">
                {usingFirebase && (
                  <span className="text-xs text-green-600 font-medium">🔄 Live</span>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-gray-500 text-sm text-center">
                  {usingFirebase ? '✅ All caught up!' : 'No notifications'}
                </p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n._id}
                    onClick={() => {
                      if (!n.read) markRead(n._id);
                      setOpen(false);
                      if (n.complaintId) navigate(`/complaint/${n.complaintId}`);
                    }}
                    className={`block p-3 border-b hover:bg-gray-50 cursor-pointer transition ${
                      !n.read ? 'bg-primary-50/50 font-medium' : ''
                    }`}
                  >
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-gray-600 text-xs mt-1">{n.message}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {n.createdAt?.toDate
                        ? new Date(n.createdAt.toDate()).toLocaleString()
                        : new Date(n.createdAt).toLocaleString()}
                    </p>
                    {!n.read && (
                      <span className="inline-block mt-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        Unread
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
