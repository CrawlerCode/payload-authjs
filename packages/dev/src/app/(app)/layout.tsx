import "./globals.css";

const Layout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default Layout;
