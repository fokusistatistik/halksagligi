import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/permissions'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    // Sadece ADMIN rolü erişebilir
    if (user.rol.kod !== 'ADMIN') {
        // İzinsiz erişim durumunda dashboard'a yönlendir
        redirect('/dashboard')
    }

    return <>{children}</>
}
