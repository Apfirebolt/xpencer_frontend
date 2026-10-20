import NotificationClient from './NotificationClient';

export const metadata = {
  title: 'Notifications | Xpencer',
  description: 'View your room invitations, shared expense alerts, and system notifications.',
};

export default function NotificationsPage() {
  return <NotificationClient />;
}