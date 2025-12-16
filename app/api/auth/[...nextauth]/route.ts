<<<<<<< HEAD
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/options";
=======
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/options';

/**
 * NextAuth.js API Route Handler
 *
 * This handles all NextAuth.js authentication routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback
 * - /api/auth/session
 * - etc.
 */
>>>>>>> 688cb8399544cb48ad1e4bd218a7ee9d5f50d8fd

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
