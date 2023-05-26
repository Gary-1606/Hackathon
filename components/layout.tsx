import Image from 'next/image';
import logo from '../public/assets/logo.png';
import akqalogo from '../public/assets/akqalogo.png'
import Link from 'next/link';
interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto flex flex-col space-y-4">
      <header className="sticky top-0 z-40 w-full bg-[#004b8d]">
        <div className="border-b border-b-slate-200 py-4">
          <nav className="flex flex-row items-center gap-20 text-6xl font-serif px-20">
            <Link href={'#'}>
              <Image src={logo} alt={'nmfc logo'} width={100} height={100} />
            </Link>
            <p className="uppercase text-white">Home of the Kangaroos</p>
          </nav>
        </div>
      </header>
      <div>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
      <footer className="bg-[#004b8d] text-white py-8 w-full">
        <div className="container mx-auto">
          <div className="space-x-4 flex items-center justify-between">
            <Image src={logo} alt="Company Logo" width={60} height={60} />
            <div className="flex items-center space-x-2">
              <Image
                src={akqalogo}
                alt="Company Placeholder"
                width={100}
                height={100}
              />
            </div>
            <p className="text-sm font-medium">
              © {new Date().getFullYear()} Team HAI-5
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
