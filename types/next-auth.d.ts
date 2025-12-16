import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      tc_kimlik_no: string;
      rol: any;
      birim: any;
      ilk_giris: boolean;
      profil_foto_url: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    tc_kimlik_no: string;
    rol: any;
    birim: any;
    ilk_giris: boolean;
    profil_foto_url: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    tc_kimlik_no: string;
    rol: any;
    birim: any;
    ilk_giris: boolean;
    profil_foto_url: string | null;
  }
}
