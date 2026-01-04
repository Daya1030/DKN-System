// Notification decorator pattern for composable notification functionality

export interface NotificationPayload {
  user_id?: string | number
  title: string
  message: string
  type: string
  [key: string]: any
}

export type NotificationDecorator = (notification: NotificationPayload) => NotificationPayload

// Base notification creator
export const createNotification = async (payload: NotificationPayload, endpoint: string = 'http://localhost:5001/api/notifications'): Promise<any> => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Failed to create notification: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Notification creation error:', error)
    throw error
  }
}

// Decorator: Add timestamp
export const withTimestamp = (): NotificationDecorator => {
  return (notification: NotificationPayload) => ({
    ...notification,
    created_at: new Date().toISOString()
  })
}

// Decorator: Add logging
export const withLogging = (label: string = 'Notification'): NotificationDecorator => {
  return (notification: NotificationPayload) => {
    console.log(`[${label}] Creating notification:`, notification)
    return notification
  }
}

// Decorator: Add default type
export const withDefaultType = (defaultType: string = 'info'): NotificationDecorator => {
  return (notification: NotificationPayload) => ({
    ...notification,
    type: notification.type || defaultType
  })
}

// Decorator: Add validation
export const withValidation = (): NotificationDecorator => {
  return (notification: NotificationPayload) => {
    if (!notification.title || !notification.message) {
      throw new Error('Notification must have title and message')
    }
    return notification
  }
}

// Decorator: Add priority (for styling/sorting)
export const withPriority = (priority: 'low' | 'medium' | 'high' = 'medium'): NotificationDecorator => {
  return (notification: NotificationPayload) => ({
    ...notification,
    priority: notification.priority || priority
  })
}

// Decorator: Format for broadcast (all users)
export const forBroadcast = (): NotificationDecorator => {
  return (notification: NotificationPayload) => {
    const { user_id, ...rest } = notification
    return rest
  }
}

// Compose multiple decorators
export const composeDecorators = (...decorators: NotificationDecorator[]): NotificationDecorator => {
  return (notification: NotificationPayload) => {
    return decorators.reduce((acc, decorator) => decorator(acc), notification)
  }
}

// Notification builder with fluent API
export class NotificationBuilder {
  private payload: NotificationPayload = {
    title: '',
    message: '',
    type: 'info'
  }

  private decorators: NotificationDecorator[] = []

  constructor(title: string, message: string) {
    this.payload.title = title
    this.payload.message = message
  }

  setType(type: string): this {
    this.payload.type = type
    return this
  }

  setUserId(userId: string | number): this {
    this.payload.user_id = userId
    return this
  }

  setPriority(priority: 'low' | 'medium' | 'high'): this {
    this.payload.priority = priority
    return this
  }

  addDecorator(decorator: NotificationDecorator): this {
    this.decorators.push(decorator)
    return this
  }

  addDecorators(...decorators: NotificationDecorator[]): this {
    this.decorators.push(...decorators)
    return this
  }

  build(): NotificationPayload {
    return this.decorators.reduce((acc, decorator) => decorator(acc), { ...this.payload })
  }

  async send(endpoint?: string): Promise<any> {
    const finalPayload = this.build()
    return createNotification(finalPayload, endpoint)
  }
}

// Pre-configured notification creators
export const notificationCreators = {
  // Group created notification - broadcast to all users
  groupCreated: (groupName: string) => {
    return new NotificationBuilder('Group Created', `Group "${groupName}" has been created successfully`)
      .setType('group_created')
      .setPriority('high')
      .addDecorators(
        withValidation(),
        withLogging('GroupCreated'),
        withTimestamp()
      )
  },

  // User joined group notification
  userJoinedGroup: (userName: string, groupName: string, userId?: string | number) => {
    return new NotificationBuilder('User Joined', `${userName} joined ${groupName}`)
      .setType('user_joined_group')
      .setPriority('medium')
      .addDecorators(
        withValidation(),
        withLogging('UserJoined'),
        withTimestamp()
      )
      .setUserId(userId || '')
  },

  // Message notification
  newMessage: (senderName: string, message: string, userId?: string | number) => {
    return new NotificationBuilder('New Message', `${senderName}: ${message}`)
      .setType('message')
      .setPriority('high')
      .addDecorators(
        withValidation(),
        withLogging('NewMessage'),
        withTimestamp()
      )
      .setUserId(userId || '')
  },

  // Document approval notification
  documentApproved: (docName: string, userId?: string | number) => {
    return new NotificationBuilder('Document Approved', `Document "${docName}" has been approved`)
      .setType('document_approved')
      .setPriority('medium')
      .addDecorators(
        withValidation(),
        withLogging('DocumentApproved'),
        withTimestamp()
      )
      .setUserId(userId || '')
  }
}

// Helper: Send broadcast notification (to all users)
export const sendBroadcastNotification = async (title: string, message: string, type: string): Promise<any> => {
  try {
    const response = await fetch('http://localhost:5001/api/communities/notify-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, type })
    })

    if (!response.ok) {
      throw new Error(`Failed to broadcast: ${response.statusText}`)
    }

    console.log('[BroadcastNotification] Sent to all users:', { title, message, type })
    return await response.json()
  } catch (error) {
    console.error('Broadcast notification error:', error)
    throw error
  }
}
