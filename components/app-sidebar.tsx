"use client"

import { Home, Database, NotebookIcon, BarChart2, Rocket, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"

const items = [
  { title: "Editor", url: "#editor", icon: Home },
  { title: "Notebook", url: "#notebook", icon: NotebookIcon },
  { title: "Datasets", url: "#datasets", icon: Database },
  { title: "Dashboard", url: "#dashboard", icon: BarChart2 },
  { title: "Deploy", url: "#deploy", icon: Rocket },
  { title: "Settings", url: "#settings", icon: Settings },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-2">
        <div className="text-base font-semibold">OpenMinds</div>
        <div className="text-xs text-muted-foreground">ML IDE</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="text-xs text-muted-foreground px-3 py-2">{"Ctrl/Cmd + b to toggle"}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
