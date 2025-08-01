import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-wrapper"

export default auth((req) => {
  const { auth: session } = req
  const isAuth = !!session
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return null
  }

  if (!isAuth) {
    let from = req.nextUrl.pathname
    if (req.nextUrl.search) {
      from += req.nextUrl.search
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
    )
  }

  // Role-based access control
  const userRole = session?.user?.role as string
  const pathname = req.nextUrl.pathname

  // Admin-only routes
  if (pathname.startsWith('/admin') && userRole !== 'Admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  // Manager and Admin routes
  if (
    (pathname.startsWith('/users') || 
     pathname.startsWith('/warehouses') ||
     pathname.includes('/create') ||
     pathname.includes('/edit')) && 
    !['Admin', 'Manager'].includes(userRole)
  ) {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|unauthorized).*)',
  ],
}