import Navbar from "@/components/sections/menu/Navbar";


export default function CVBuilderÁILayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>
    <Navbar />
    {children}
  </>;
}