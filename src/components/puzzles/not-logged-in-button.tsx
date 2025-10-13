import LoginButton from "@/components/header-footer/LoginButton";
import Image from "next/image";

export default function NotLoggedInButton() {
  return (
    <div className="flex flex-col justify-center items-center gap-6">
      <Image
        src="/heros/table_study_white.png"
        alt="Study chess"
        width={400}
        height={400}
        className="rounded-lg opacity-90"
      />
      <div className="text-red-500 flex justify-center items-center">
        You must sign in to pratice!
        <div className="px-5">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
