import express from 'express';
const router = express.Router();
import notificationController from '../controllers/notificationController.js';

// Get notifications for a user
router.get('/:userType/:userId', notificationController.getNotifications);

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

