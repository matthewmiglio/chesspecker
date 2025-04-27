import LoginButton from "@/components/LoginButton";

export default function NotLoggedInButton() {
  return (
    <div className="text-red-500 grid-cols-1 flex justify-center items-center">
      You must sign in to pratice!
      <div className="px-5">
        {" "}
        <LoginButton />
      </div>
    </div>
  );
}
