"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  ClipboardList,
  GraduationCap,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AnimatedLanguageSwitcher } from "@/components/ui/animated-language-switcher";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Chat",
    description: "Ask the assistant your admissions questions",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Gap Analysis",
    description: "See how you measure up against requirements",
    href: "/gap-analysis",
    icon: BrainCircuit,
  },
  {
    title: "Qualifying Degrees",
    description: "Discover the degrees that match your profile",
    href: "/qualifying-degrees",
    icon: GraduationCap,
  },
  {
    title: "Quiz",
    description: "Take a quick quiz to personalise your path",
    href: "/quiz",
    icon: ClipboardList,
  },
  {
    title: "Results",
    description: "Review your saved degree findings",
    href: "/results",
    icon: Sparkles,
  },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const currentNav = navItems.find((item) => pathname.startsWith(item.href));
  const isActivePath = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar
          collapsible="icon"
          className="border-r border-border/40 bg-sidebar shadow-[0_0_24px_rgba(88,28,135,0.18)]"
        >
          <SidebarHeader>
            <div className="rounded-xl border border-border/50 bg-[radial-gradient(circle_at_top,var(--color-primary)/22%,transparent_65%)] p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary shadow-[0_0_18px_rgba(168,85,247,0.32)]">
                  <GraduationCap className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                    Dream Degree
                  </span>
                  <span className="text-xs text-sidebar-foreground/80">
                    Navigate your academic journey
                  </span>
                </div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(item.href);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-lg border border-transparent bg-transparent text-sidebar-foreground transition-colors",
                            "hover:border-primary/25 hover:bg-primary/10 hover:text-primary/90",
                            "group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:px-0",
                            isActive &&
                              "border-primary/40 bg-primary/20 text-primary shadow-[0_0_22px_rgba(168,85,247,0.25)]"
                          )}
                        >
                          <Link href={item.href} className="flex w-full items-center gap-3" prefetch>
                            <span
                              className={cn(
                                "flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary transition-all",
                                "group-data-[collapsible=icon]/sidebar:size-10",
                                isActive &&
                                  "bg-primary text-primary-foreground shadow-[0_0_18px_rgba(168,85,247,0.35)]"
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            <span className="flex flex-1 flex-col text-left group-data-[collapsible=icon]/sidebar:hidden">
                              <span className="text-sm font-semibold leading-tight">
                                {item.title}
                              </span>
                              <span className="text-xs text-sidebar-foreground/70 leading-tight">
                                {item.description}
                              </span>
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarSeparator className="my-2 border-border/30" />
          <SidebarFooter>
            <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary/5 p-3">
              <AnimatedLanguageSwitcher className="hidden sm:block" />
              <AnimatedThemeToggler />
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/40 bg-[var(--color-surface)] px-4 shadow-[0_6px_24px_rgba(35,12,64,0.35)]">
              <SidebarTrigger className="md:hidden" />
              <div className="flex flex-1 flex-col justify-center sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {currentNav ? "Now viewing" : "Dream Degree"}
                  </span>
                  <span className="text-lg font-semibold text-primary">
                    {currentNav?.title ?? "Dream Degree"}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 sm:mt-0">
                  <AnimatedLanguageSwitcher className="sm:hidden" />
                  <AnimatedThemeToggler className="sm:hidden" />
                </div>
              </div>
            </header>
            <div className="flex-1">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
