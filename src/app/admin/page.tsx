import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  // Automatically redirect anyone visiting /admin to the dashboard
  redirect('/admin/dashboard'); 
}