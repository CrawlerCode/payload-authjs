import { signIn } from "@/auth.customers";

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn();
      }}
    >
      <button type="submit">Sign In (Customer)</button>
    </form>
  );
}
