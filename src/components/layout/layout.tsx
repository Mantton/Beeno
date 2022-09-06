import { ReactNode } from 'react'
import Footer from './nav/footer'
import NavBar from './nav/navbar'

interface LayoutInterface {
    children: ReactNode
}
export default function Layout({ children }: LayoutInterface) {
    return (
        <>
            <NavBar />
            <div className="min-h-screen">{children}</div>
            <Footer />
        </>
    )
}
