import express from 'express';
import jwt from 'jsonwebtoken';
import Notification from '../models/Notification.js';
const router = express.Router();
import notificationController from '../controllers/notificationController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dentalcare_secret_key_change_in_production';

// Patient notifications via token (mobile app)
router.get('/patient', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const notifications = await Notification.find({ recipient: userId, recipientModel: 'Patient' })
      .sort({ createdAt: -1 })
      .limit(50);

    // Normalize field names for mobile app (read → isRead)
    const normalized = notifications.map(n => ({
      _id: n._id,
      id: n._id,
      title: n.title,
      message: n.message,
      type: n.type || 'general',
      isRead: n.read || false,
      read: n.read || false,
      createdAt: n.createdAt,
      data: n.data,
    }));

    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all read via token (mobile app)
router.put('/read-all', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    await Notification.updateMany(
      { recipient: decoded.id, recipientModel: 'Patient', read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get notifications for a user - admin cannot see doctor/patient private notifications
router.get('/:userType/:userId', (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const { userType } = req.params;
      // Admin can only see Admin notifications, not Doctor or Patient
      if (decoded.role === 'admin' && (userType === 'Doctor' || userType === 'Patient')) {
        return res.status(403).json({ 
          message: 'Access denied. Admin cannot view private notifications.' 
        });
      }
    }
  } catch { /* let controller handle */ }
  next();
}, notificationController.getNotifications);

// Get unread count
router.get('/:userType/:userId/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.post('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Delete all notifications
router.post('/delete-all', notificationController.deleteAllNotifications);

export default router;

