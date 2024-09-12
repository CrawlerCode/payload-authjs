import jwt from "jsonwebtoken";
import { NextAuthConfig, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import github from "next-auth/providers/github";
import keycloak from "next-auth/providers/keycloak";

declare module "next-auth/jwt" {
  interface JWT extends Pick<Profile, "roles"> {
    id?: string;
  }
}

declare module "next-auth" {
  interface Profile {
    roles?: string[];
  }
  interface User extends Pick<JWT, "id" | "roles"> {}
}

export const authConfig: NextAuthConfig = {
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  providers: [
    github({
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        profile.roles = ["user"]; // Extend the profile
        return {
          id: profile.id.toString(),
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
          roles: ["user"], // Extend the user
        };
      },
    }),
    keycloak({
      allowDangerousEmailAccountLinking: true,
      profile(profile, tokens) {
        // Add roles to the profile
        if (tokens.access_token) {
          let decodedToken = jwt.decode(tokens.access_token);
          if (decodedToken && typeof decodedToken !== "string") {
            profile.roles = decodedToken.resource_access?.[process.env.AUTH_KEYCLOAK_ID!]?.roles; // Extend the profile
          }
        }
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          roles: profile.roles ?? [], // Extend the user
        };
      },
    }),
  ],
  /* session: {
    strategy: "jwt",
  }, */
  callbacks: {
    jwt: async ({ token, user, profile }) => {
      // Include user id in the JWT token
      if (user) {
        token.id = user.id;
      }
      // Include roles in the JWT token
      if (profile) {
        token.roles = profile.roles;
      }
      return token;
    },
    session: async ({ session, user, token }) => {
      // session strategy: "jwt"
      if (token) {
        if (token.id) {
          session.user.id = token.id;
        }
        session.user.roles = token.roles;
      }
      // session strategy: "database"
      if (user) {
        session.user.id = user.id;
      }
      return session;
    },
    /* signIn: async () => {
      console.log("signIn auth.ts");
      return true;
    }, */
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
  },
};
