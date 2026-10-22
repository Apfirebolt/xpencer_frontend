import RoomClient from './RoomClient';
import AuthGuard from "@/components/AuthGuard";

export const metadata = {
  title: 'Expense Rooms | Xpencer',
  description: 'Collaborative shared expense rooms and group splitting',
};

export default function RoomsPage() {
  return (
    <AuthGuard>
      <RoomClient />
    </AuthGuard>
  );
}