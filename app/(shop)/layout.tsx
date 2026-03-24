import { Footer } from "@/components/layout/footer";

export default function ShopLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {children}
      {modal}
      <Footer />
    </div>
  );
}
