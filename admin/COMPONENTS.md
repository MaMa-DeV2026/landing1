# 🎨 shadcn/ui Component Examples

## Layout Components

### Sidebar Navigation

```tsx
// components/layout/sidebar.tsx
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  MessageSquare,
  Star,
  BarChart3,
  Settings,
  FileText,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Testimonials", href: "/admin/testimonials", icon: Star },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-gray-50">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <div className="h-8 w-8 rounded bg-orange-500" />
          <span>mamad_dev Admin</span>
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100",
              "text-gray-600"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-4 left-0 right-0 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
          <LogOut className="h-5 w-5" />
          خروج
        </button>
      </div>
    </aside>
  );
}
```

## Dashboard Stats Card

```tsx
// components/dashboard/stats-card.tsx
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-sm",
                  changeType === "increase" && "text-green-600",
                  changeType === "decrease" && "text-red-600",
                  changeType === "neutral" && "text-gray-500"
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div className="rounded-full bg-orange-100 p-3 text-orange-600">
            <icon className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Data Table

```tsx
// components/tables/projects-table.tsx
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const projects = [
  {
    id: "1",
    title: "فروشگاه Bloom",
    category: "E-commerce",
    status: "PUBLISHED",
    views: 1250,
    createdAt: "2024-06-01",
  },
];

export function ProjectsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">{project.title}</TableCell>
            <TableCell>{project.category}</TableCell>
            <TableCell>
              <Badge
                variant={
                  project.status === "PUBLISHED" ? "default" : "secondary"
                }
              >
                {project.status}
              </Badge>
            </TableCell>
            <TableCell>{project.views.toLocaleString()}</TableCell>
            <TableCell>{project.createdAt}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Form Example

```tsx
// components/forms/project-form.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

const projectSchema = z.object({
  title: z.string().min(2, "Title is required"),
  titleEn: z.string().optional(),
  description: z.string().min(10, "Description is required"),
  category: z.string(),
  imageUrl: z.string().url().optional(),
  link: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function ProjectForm() {
  const router = useRouter();
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      tags: [],
    },
  });

  async function onSubmit(data: ProjectFormData) {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (Persian)</FormLabel>
              <FormControl>
                <Input placeholder="عنوان پروژه" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Project</Button>
      </form>
    </Form>
  );
}
```

## Analytics Chart

```tsx
// components/dashboard/analytics-chart.tsx
"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { date: "Mon", visitors: 120 },
  { date: "Tue", visitors: 150 },
  { date: "Wed", visitors: 180 },
  { date: "Thu", visitors: 140 },
  { date: "Fri", visitors: 200 },
];

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="visitors"
          stroke="#e8590c"
          fill="#e8590c"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```
