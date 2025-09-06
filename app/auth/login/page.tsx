import { LoginForm } from "@/components/login-form";
import { StarfieldBackground } from "@/components/lastresort/StarfieldBackground";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      <StarfieldBackground />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative z-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
