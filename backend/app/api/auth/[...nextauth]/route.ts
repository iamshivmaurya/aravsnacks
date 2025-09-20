import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/login`, {
            username: credentials?.username,
            password: credentials?.password,
          });

          // Backend should return { username, role, access_token }
          if (res.data && res.data.access_token) {
            return res.data;
          }
          return null;
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Store user info and access token in JWT
      if (user) {
        token.username = user.username;
        token.role = user.role;
        token.accessToken = user.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose JWT info to client session
      if (token) {
        (session.user as any) = {
          username: token.username,
          role: token.role,
          accessToken: token.accessToken,
        };
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/admin/login",
  },

  secret: process.env.NEXTAUTH_SECRET || "ABC123",
});

export { handler as GET, handler as POST };
