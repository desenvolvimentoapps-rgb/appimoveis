import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isMaster = token?.level === "MASTER";
        const pathname = req.nextUrl.pathname;


        // Se acessar /admin e não for MASTER, redireciona para /gerenciadeimovel
        if (pathname.startsWith("/admin") && !isMaster) {
            return NextResponse.redirect(new URL("/gerenciadeimovel", req.url));
        }

        // Se acessar /gerenciadeimovel e for MASTER (opcional, pode permitir ambos), 
        // ou apenas garantir que está logado (withAuth já faz isso para matches)

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/gerenciadeimovel/:path*"],
};
