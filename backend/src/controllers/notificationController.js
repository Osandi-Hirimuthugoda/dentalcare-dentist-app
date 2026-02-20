import Notification from '../models/Notification.js';

// Send notification helper function
export const sendNotification = async (recipientId, recipientModel, type, title, message, data = {}, senderId = null, senderModel = 'System') => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      recipientModel,
      sender: senderId,
      senderModel,
      type,
      title,
      message,
      data,
      actionUrl: data.actionUrl || null
    });

    // Emit real-time notification via Socket.io
    if (global.io) {
      global.io.to(`${recipientModel}_${recipientId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    
    const notifications = await Notification.find({
      recipient: userId,
      recipientModel: userType
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      recipientModel: userType,
      read: false
    });

    res.json({
      notifications,
      unreadCount,
      total: await Notification.countDocuments({ recipient: userId, recipientModel: userType })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    const count = await Notification.countDocuments({
      recipient: userId,
      recipientModel: userType,
      read: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const { userId, userType } = req.body;
    
    await Notification.updateMany(
      { recipient: userId, recipientModel: userType, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndDelete(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all notifications
export const deleteAllNotifications = async (req, res) => {
  try {
    const { userId, userType } = req.body;
    
    await Notification.deleteMany({
      recipient: userId,
      recipientModel: userType
    });

    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  sendNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
};

