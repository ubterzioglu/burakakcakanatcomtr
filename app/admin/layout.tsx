export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="site-frame min-h-screen px-6 py-8 md:px-10">{children}</div>;
}
