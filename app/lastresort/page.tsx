import { redirect } from 'next/navigation'

export default function LastResortPage() {
  // Redirect to dashboard - this is the main entry point
  redirect('/lastresort/dashboard')
}