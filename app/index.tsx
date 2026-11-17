// Entry point: sends the member to the right side of the auth gate.
import { Redirect } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';

export default function Index() {
  const { status, needsNotificationPrompt } = useAuth();
  if (status !== 'signedIn') return <Redirect href="/login" />;
  if (needsNotificationPrompt) return <Redirect href="/notifications-permission" />;
  return <Redirect href="/tasks" />;
}
