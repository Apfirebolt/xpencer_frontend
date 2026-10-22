import SettingClient from './SettingClient';
import AuthGuard from "@/components/AuthGuard";

export const metadata = {
  title: 'Account Settings | Xpencer',
  description: 'Manage your profile details, password security, and avatar settings.',
};

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingClient />
    </AuthGuard>
  );
}