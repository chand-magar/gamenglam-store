import { Navbar }           from '@/components/layout/Navbar';
import { Footer }           from '@/components/layout/Footer';
import { AuthInitializer }  from '@/components/layout/AuthInitializer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthInitializer />
      <Navbar />
      <main style={{ paddingBottom: 64 }}>{children}</main>
      <Footer />
    </>
  );
}
