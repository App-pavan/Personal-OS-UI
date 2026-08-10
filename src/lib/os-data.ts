import {
  Banknote,
  ClipboardCheck,
  BrainCircuit,
  CalendarDays,
  FileText,
  FolderKanban,
  HardDrive,
  Heart,
  Home,
  KeyRound,
  LayoutGrid,
  ListChecks,
  NotebookPen,
  Plane,
  ShoppingBasket,
  Sparkles,
  Users,
  UtensilsCrossed,
  Settings,
  Library,
  Music,
} from "lucide-react";

export type ModuleDef = {
  label: string;
  to: string;
  icon: typeof Home;
  group: "core" | "life" | "system";
  blurb: string;
};

export const modules: ModuleDef[] = [
  { label: "Dashboard", to: "/", icon: LayoutGrid, group: "core", blurb: "Everything at a glance" },
  {
    label: "AI Assistant",
    to: "/assistant",
    icon: Sparkles,
    group: "core",
    blurb: "Your personal intelligence",
  },
  { label: "Tasks", to: "/tasks", icon: ListChecks, group: "core", blurb: "Today and beyond" },
  {
    label: "Checklists",
    to: "/checklists",
    icon: ClipboardCheck,
    group: "core",
    blurb: "Reusable routines",
  },
  {
    label: "Projects",
    to: "/projects",
    icon: FolderKanban,
    group: "core",
    blurb: "Long running work",
  },
  { label: "Calendar", to: "/calendar", icon: CalendarDays, group: "core", blurb: "Your schedule" },
  { label: "Finance", to: "/finance", icon: Banknote, group: "life", blurb: "Money, calmly" },
  { label: "Documents", to: "/documents", icon: FileText, group: "life", blurb: "Files and papers" },
  { label: "Notes", to: "/notes", icon: NotebookPen, group: "life", blurb: "Thinking space" },
  {
    label: "Knowledge",
    to: "/knowledge",
    icon: Library,
    group: "life",
    blurb: "Saved and understood",
  },
  { label: "Health", to: "/health", icon: Heart, group: "life", blurb: "Body and rhythm" },
  { label: "Family", to: "/family", icon: Users, group: "life", blurb: "Shared life" },
  { label: "Recipes", to: "/recipes", icon: UtensilsCrossed, group: "life", blurb: "What's cooking" },
  {
    label: "Shopping",
    to: "/shopping",
    icon: ShoppingBasket,
    group: "life",
    blurb: "Lists and orders",
  },
  { label: "Travel", to: "/travel", icon: Plane, group: "life", blurb: "Trips ahead" },
  { label: "Media", to: "/media", icon: Music, group: "life", blurb: "Listening and watching" },
  {
    label: "Passwords",
    to: "/passwords",
    icon: KeyRound,
    group: "system",
    blurb: "Vault and secrets",
  },
  { label: "NAS", to: "/nas", icon: HardDrive, group: "system", blurb: "Storage and backups" },
  { label: "Home", to: "/home", icon: Home, group: "system", blurb: "Automation and rooms" },
  { label: "Settings", to: "/settings", icon: Settings, group: "system", blurb: "Preferences" },
];

export const primaryNav = [
  { label: "Home", to: "/", icon: LayoutGrid },
  { label: "Tasks", to: "/tasks", icon: ListChecks },
  { label: "Lists", to: "/checklists", icon: ClipboardCheck },
  { label: "AI", to: "/assistant", icon: BrainCircuit },
  { label: "Family", to: "/family", icon: Users },
];

export const user = {
  name: "Pavan",
  initials: "PV",
  email: "pavan@personalos.app",
  plan: "Premium",
};

export type Task = {
  id: string;
  title: string;
  module: string;
  due: string;
  priority: "low" | "medium" | "high";
  done: boolean;
  project?: string;
};

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Review Q3 investment allocation",
    module: "Finance",
    due: "Today · 4:00 PM",
    priority: "high",
    done: false,
    project: "Wealth plan",
  },
  {
    id: "t2",
    title: "Renew home insurance policy",
    module: "Documents",
    due: "Today · 6:30 PM",
    priority: "high",
    done: false,
  },
  {
    id: "t3",
    title: "Rotate NAS backup encryption keys",
    module: "NAS",
    due: "Tomorrow",
    priority: "medium",
    done: false,
    project: "Home infra",
  },
  {
    id: "t4",
    title: "Plan Kerala trip itinerary",
    module: "Travel",
    due: "Fri",
    priority: "medium",
    done: false,
    project: "Kerala 2026",
  },
  {
    id: "t5",
    title: "Book dentist appointment for Aarav",
    module: "Family",
    due: "Sat",
    priority: "low",
    done: false,
  },
  {
    id: "t6",
    title: "Archive 2025 tax documents",
    module: "Documents",
    due: "Yesterday",
    priority: "low",
    done: true,
  },
  {
    id: "t7",
    title: "Morning walk · 5km",
    module: "Health",
    due: "Today · 7:00 AM",
    priority: "low",
    done: true,
  },
];

export const events = [
  { id: "e1", title: "Team standup", time: "10:00 – 10:30", tag: "Work", accent: "primary" },
  { id: "e2", title: "Doctor appointment", time: "16:00 – 17:00", tag: "Health", accent: "accent" },
  { id: "e3", title: "Dinner with family", time: "19:30 – 21:00", tag: "Family", accent: "info" },
  { id: "e4", title: "Guitar practice", time: "21:30 – 22:00", tag: "Personal", accent: "success" },
];

export const weekAgenda = [
  { day: "Mon", items: ["Standup", "Budget review"] },
  { day: "Tue", items: ["Dentist", "Project sync"] },
  { day: "Wed", items: ["Gym", "Investor call", "Groceries"] },
  { day: "Thu", items: ["Standup", "Dinner with family"] },
  { day: "Fri", items: ["Trip planning"] },
  { day: "Sat", items: ["Family day"] },
  { day: "Sun", items: ["Weekly review"] },
];

export const transactions = [
  { id: "x1", name: "Zomato", category: "Food", amount: -650, when: "Today", icon: "🍜" },
  { id: "x2", name: "Spotify", category: "Media", amount: -119, when: "Yesterday", icon: "🎧" },
  { id: "x3", name: "Amazon", category: "Shopping", amount: -1999, when: "2 days ago", icon: "📦" },
  { id: "x4", name: "Salary", category: "Income", amount: 45000, when: "3 days ago", icon: "💼" },
  { id: "x5", name: "Uber", category: "Transport", amount: -320, when: "4 days ago", icon: "🚗" },
  { id: "x6", name: "Electricity", category: "Bills", amount: -1250, when: "5 days ago", icon: "💡" },
];

export const spendByCategory = [
  { name: "Food", value: 35, amount: 11498 },
  { name: "Shopping", value: 20, amount: 6570 },
  { name: "Transport", value: 15, amount: 4927 },
  { name: "Bills", value: 15, amount: 4927 },
  { name: "Others", value: 15, amount: 4928 },
];

export const balanceTrend = [
  { month: "Jan", value: 92000 },
  { month: "Feb", value: 98500 },
  { month: "Mar", value: 95200 },
  { month: "Apr", value: 108400 },
  { month: "May", value: 116900 },
  { month: "Jun", value: 128450 },
];

export const budgets = [
  { name: "Monthly budget", spent: 32000, total: 50000 },
  { name: "Food", spent: 8250, total: 12000 },
  { name: "Travel", spent: 4200, total: 15000 },
  { name: "Subscriptions", spent: 1780, total: 2500 },
];

export const documents = [
  { id: "d1", name: "Home insurance 2026.pdf", size: "2.4 MB", when: "Today", kind: "PDF" },
  { id: "d2", name: "Passport scan.jpg", size: "1.1 MB", when: "Yesterday", kind: "Image" },
  { id: "d3", name: "Tax return 2025.pdf", size: "3.8 MB", when: "2 days ago", kind: "PDF" },
  { id: "d4", name: "Apartment lease.docx", size: "640 KB", when: "Last week", kind: "Doc" },
  { id: "d5", name: "Car service invoice.pdf", size: "820 KB", when: "Last week", kind: "PDF" },
];

export const projects = [
  {
    id: "p1",
    name: "Home infrastructure",
    progress: 72,
    tasks: 14,
    done: 10,
    tag: "Personal",
    due: "Aug 30",
  },
  {
    id: "p2",
    name: "Kerala 2026 trip",
    progress: 35,
    tasks: 18,
    done: 6,
    tag: "Travel",
    due: "Nov 12",
  },
  {
    id: "p3",
    name: "Wealth plan rebuild",
    progress: 54,
    tasks: 11,
    done: 6,
    tag: "Finance",
    due: "Sep 15",
  },
  {
    id: "p4",
    name: "Photo library cleanup",
    progress: 88,
    tasks: 9,
    done: 8,
    tag: "Media",
    due: "Aug 12",
  },
];

export const notes = [
  {
    id: "n1",
    title: "Weekly review template",
    excerpt: "What moved forward, what stalled, what to drop entirely…",
    when: "Today",
  },
  {
    id: "n2",
    title: "Home server ideas",
    excerpt: "Immich for photos, Paperless for docs, off-site weekly sync…",
    when: "Yesterday",
  },
  {
    id: "n3",
    title: "Books to read",
    excerpt: "Seeing Like a State, The Beginning of Infinity, Piranesi…",
    when: "3 days ago",
  },
  {
    id: "n4",
    title: "Aarav's school checklist",
    excerpt: "Uniform, sports kit, parent-teacher meeting on the 14th…",
    when: "Last week",
  },
];

export const passwords = [
  { id: "k1", name: "Apple ID", user: "pavan@icloud.com", strength: 96, updated: "2 weeks ago" },
  { id: "k2", name: "Bank of India", user: "pavan.os", strength: 88, updated: "1 month ago" },
  { id: "k3", name: "GitHub", user: "pavan-dev", strength: 99, updated: "5 days ago" },
  { id: "k4", name: "Netflix", user: "family@personalos.app", strength: 54, updated: "9 months ago" },
  { id: "k5", name: "Airline account", user: "pavan@personalos.app", strength: 72, updated: "3 months ago" },
];

export const nasVolumes = [
  { id: "v1", name: "Media", used: 4.2, total: 8, unit: "TB", health: "Healthy" },
  { id: "v2", name: "Documents", used: 0.9, total: 2, unit: "TB", health: "Healthy" },
  { id: "v3", name: "Backups", used: 3.4, total: 4, unit: "TB", health: "Attention" },
];

export const familyMembers = [
  { id: "f1", name: "Meera", role: "Partner", status: "At the studio", initials: "ME" },
  { id: "f2", name: "Aarav", role: "Son", status: "School until 3 PM", initials: "AA" },
  { id: "f3", name: "Riya", role: "Daughter", status: "Home", initials: "RI" },
  { id: "f4", name: "Dad", role: "Parent", status: "Walking", initials: "DA" },
];

export const familyUpdates = [
  { id: "fu1", who: "Meera", what: "Added 'Pick up groceries' to the shared list", when: "12m ago" },
  { id: "fu2", who: "Aarav", what: "Shared school calendar for August", when: "1h ago" },
  { id: "fu3", who: "Riya", what: "Uploaded 24 photos to Summer album", when: "Yesterday" },
];

export const aiSuggestions = [
  { id: "a1", text: "Your electricity bill is due in 3 days.", action: "Pay now" },
  { id: "a2", text: "You have 12 unread documents to file.", action: "Review" },
  { id: "a3", text: "You spent ₹2,160 less than last week.", action: "See breakdown" },
  { id: "a4", text: "Backups volume is at 85%. Prune old snapshots?", action: "Clean up" },
];

export const aiPrompts = [
  "Summarize my expenses this month",
  "What's on my schedule today?",
  "Find documents related to taxes",
  "Draft a weekly review from my notes",
];

export const activity = [
  { id: "ac1", what: "Renewed domain personalos.app", module: "Documents", when: "22m ago" },
  { id: "ac2", what: "Backup completed · 412 GB", module: "NAS", when: "1h ago" },
  { id: "ac3", what: "Budget for Food updated", module: "Finance", when: "3h ago" },
  { id: "ac4", what: "3 tasks completed", module: "Tasks", when: "Yesterday" },
];

export const health = {
  steps: 8420,
  stepGoal: 10000,
  sleep: "7h 12m",
  resting: 62,
  water: 1.8,
  waterGoal: 2.5,
  week: [
    { day: "M", value: 7200 },
    { day: "T", value: 9100 },
    { day: "W", value: 6400 },
    { day: "T", value: 11200 },
    { day: "F", value: 8600 },
    { day: "S", value: 12400 },
    { day: "S", value: 8420 },
  ],
};

export const weather = {
  city: "Bengaluru",
  temp: 24,
  condition: "Light showers",
  high: 27,
  low: 20,
  humidity: 67,
};

export const rooms = [
  { id: "r1", name: "Living room", devices: 6, on: 3, temp: 24 },
  { id: "r2", name: "Bedroom", devices: 4, on: 1, temp: 22 },
  { id: "r3", name: "Kitchen", devices: 5, on: 2, temp: 26 },
  { id: "r4", name: "Study", devices: 3, on: 3, temp: 23 },
];

export const nowPlaying = {
  title: "I Took A Ride",
  artist: "Caroline Rose",
  album: "Superstar",
  elapsed: "2:41",
  total: "5:12",
  progress: 52,
};

export const recipes = [
  { id: "rc1", name: "Lemon herb salmon", time: "25 min", tag: "Dinner" },
  { id: "rc2", name: "Masala oats bowl", time: "10 min", tag: "Breakfast" },
  { id: "rc3", name: "Paneer tikka wraps", time: "35 min", tag: "Lunch" },
  { id: "rc4", name: "Chocolate ragi cake", time: "50 min", tag: "Dessert" },
];

export const shopping = [
  { id: "s1", name: "Olive oil", qty: "1 L", done: false },
  { id: "s2", name: "Coffee beans", qty: "500 g", done: false },
  { id: "s3", name: "Bananas", qty: "6", done: true },
  { id: "s4", name: "Dish soap", qty: "2", done: false },
  { id: "s5", name: "Almond milk", qty: "1 L", done: true },
];

export const trips = [
  { id: "tr1", name: "Kerala backwaters", dates: "Nov 12 – Nov 19", status: "Planning" },
  { id: "tr2", name: "Tokyo winter", dates: "Jan 8 – Jan 18", status: "Idea" },
  { id: "tr3", name: "Goa weekend", dates: "Sep 5 – Sep 7", status: "Booked" },
];

export const knowledge = [
  { id: "kb1", title: "Personal finance system", items: 24, tag: "Finance" },
  { id: "kb2", title: "Self-hosting playbook", items: 18, tag: "Infra" },
  { id: "kb3", title: "Parenting notes", items: 31, tag: "Family" },
  { id: "kb4", title: "Design references", items: 47, tag: "Design" },
];

export const mediaLibrary = [
  { id: "m1", title: "Superstar", sub: "Caroline Rose · Album", tag: "Music" },
  { id: "m2", title: "Severance S2", sub: "8 of 10 watched", tag: "Show" },
  { id: "m3", title: "Summer 2026", sub: "482 photos", tag: "Photos" },
  { id: "m4", title: "Deep focus", sub: "42 tracks", tag: "Playlist" },
];

export const storage = { used: 68, total: 14, unit: "TB" };
