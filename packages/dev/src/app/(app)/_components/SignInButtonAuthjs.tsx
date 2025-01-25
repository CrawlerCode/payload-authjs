import { signIn } from "@/auth";

export function SignInButtonAuthjs() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn();
      }}
    >
      <button type="submit">Sign In (Auth.js)</button>
    </form>
  );
}
