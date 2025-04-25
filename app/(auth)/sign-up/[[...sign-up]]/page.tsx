import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-green-600 hover:bg-green-800 text-sm md:text-base",
            card: "shadow-lg rounded-lg"
          }
        }}
      />
    </div>
  );
}