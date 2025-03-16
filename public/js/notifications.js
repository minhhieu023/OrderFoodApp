async function scheduleOrderNotification(time) {
  try {
    const response = await fetch('/users/settings/notification-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ time })
    });

    if (!response.ok) {
      throw new Error('Failed to update notification time');
    }

    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
}

async function updateNotificationContent(title, body) {
  try {
    const response = await fetch('/users/settings/notification-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, body })
    });

    if (!response.ok) {
      throw new Error('Failed to update notification content');
    }

    return true;
  } catch (error) {
    console.error('Error updating notification content:', error);
    return false;
  }
} 