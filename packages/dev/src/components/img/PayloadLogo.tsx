export const PayloadLogo = ({ variant = "dark" }: { variant?: "light" | "dark" }) => (
  <img
    src={`https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/packages/ui/src/assets/payload-favicon-${variant}.png`}
    alt="Payload Logo"
  />
);
