import NotificationClient from './NotificationClient';
import AuthGuard from "@/components/AuthGuard";

export const metadata = {
  title: 'Notifications | Xpencer',
  description: 'View your room invitations, shared expense alerts, and system notifications.',
};

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationClient />
    </AuthGuard>
  );
}