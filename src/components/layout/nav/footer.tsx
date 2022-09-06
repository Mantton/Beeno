import Link from 'next/link'

export default function Footer() {
    return (
        <footer className=" p-5 bg-black bg-opacity-90">
            <div className="text-sm flex justify-between text-white">
                <Link href="https://mantton.com">
                    <a rel="noreferrer" target="_blank">
                        A Mantton Project
                    </a>
                </Link>
                <div className="notSoLegal"></div>
            </div>
        </footer>
    )
}
