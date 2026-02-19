import PanelChrome from "@/components/dashboard/PanelChrome"

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PanelChrome>{children}</PanelChrome>
}
