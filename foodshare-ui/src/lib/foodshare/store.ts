import { create } from "zustand";

/* ------------------------------------------------------------------ */
/* FoodShare demo store — every value mirrors the approved PDF design  */
/* (demo clock pinned to BENGALURU · 08 NOV 2026 · 10:30 IST)          */
/* ------------------------------------------------------------------ */

export const APP_NOW = new Date("2026-11-08T10:30:00+05:30");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Wall-clock parts in IST regardless of the environment timezone. */
function istParts(d: Date) {
  const ist = new Date(d.getTime() + 5.5 * 3_600_000);
  return {
    dd: ist.getUTCDate(),
    month: ist.getUTCMonth(),
    yyyy: ist.getUTCFullYear(),
    hh: ist.getUTCHours(),
    mm: ist.getUTCMinutes(),
  };
}

/** Parse a datetime-local value ("2026-11-09T18:00") as IST wall time. */
export function parseIST(iso: string): Date {
  const s = iso.length === 16 ? `${iso}:00` : iso;
  return new Date(`${s}+05:30`);
}

export function fmtIST(d: Date): string {
  const p = istParts(d);
  const dd = String(p.dd).padStart(2, "0");
  const hh = String(p.hh).padStart(2, "0");
  const mm = String(p.mm).padStart(2, "0");
  return `${dd} ${MONTHS[p.month]} ${p.yyyy}, ${hh}:${mm} IST`;
}

export function fmtShort(d: Date): string {
  const p = istParts(d);
  const dd = String(p.dd).padStart(2, "0");
  const hh = String(p.hh).padStart(2, "0");
  const mm = String(p.mm).padStart(2, "0");
  return `${dd} ${MONTHS[p.month]}, ${hh}:${mm} IST`;
}

export function clockIST(d: Date = APP_NOW): string {
  const p = istParts(d);
  const hh = String(p.hh).padStart(2, "0");
  const mm = String(p.mm).padStart(2, "0");
  return `${hh}:${mm} IST`;
}

/** "HH:mm" in IST. */
export function istClock(d: Date): string {
  const p = istParts(d);
  return `${String(p.hh).padStart(2, "0")}:${String(p.mm).padStart(2, "0")}`;
}

/* ------------------------------ types ----------------------------- */

export type Role = "vendor" | "receiver" | "admin";
export type View =
  | "landing"
  | "login"
  | "vendor-register"
  | "receiver-register"
  | "vendor-dash"
  | "receiver-dash"
  | "admin-dash";
export type DonationStatus = "available" | "claimed" | "picked_up" | "completed" | "withdrawn";
export type FoodType = "Veg" | "Non-Veg";

export interface NgoClaim {
  org: string;
  contact: string;
  phone: string;
  facility: string;
  email: string;
  claimedAtText: string;
}

export interface Donation {
  id: string;
  date: string;
  name: string;
  type: FoodType;
  qty: number;
  unit: string;
  expiryText: string;
  expiryTime: string; // "18:00"
  status: DonationStatus;
  listedAt?: string;
  claimedAt?: string;
  pickupBy?: string;
  pickedUpAt?: string;
  completedAt?: string;
  claim?: NgoClaim;
  notes?: string;
  pickupAddress?: string;
  origin: "vendor" | "nearby";
  nearbyData?: NearbyItem;
  receiptConfirmed?: boolean;
}

export interface NearbyItem {
  id: string;
  name: string;
  type: FoodType;
  qty: number;
  unit: string;
  vendor: string;
  address: string;
  expiryText: string; // "08 Nov, 18:00 IST"
  expiryTime: string; // "18:00"
  soon?: boolean;
  code: string;
  phone: string;
  distanceKm: number;
  x: number; // % position on mock map
  y: number;
  popupNote?: string;
}

export interface PendingRequest {
  id: string;
  kind: "vendor" | "receiver";
  name: string;
  category: string;
  time: string;
  addr1: string;
  addr2: string;
  contactLabel: string;
  contactName: string;
  phone: string;
  email: string;
  evidence: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface AuditEntry {
  id: string;
  tone: "green" | "red";
  badge: string;
  name: string;
  detail: string;
}

export interface VerifiedUser {
  id: string;
  kind: "vendor" | "receiver";
  name: string;
  category: string;
  email: string;
  phone: string;
  approvedAt: string;
}

/* --------------------------- fixed actors -------------------------- */

export const VENDOR_ACCOUNT = {
  role: "vendor" as Role,
  name: "Annapurna Kitchen",
  owner: "Priya Rao",
  phone: "+91 90000 12001",
  email: "annapurna.kitchen@foodshare.in",
  address: "24, 5th Cross, Indiranagar",
  fullAddress: "24, 5th Cross, Indiranagar, Bengaluru 560038",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560038",
  lat: "12.9784",
  lng: "77.6408",
};

export const RECEIVER_ACCOUNT = {
  role: "receiver" as Role,
  name: "Asha Foundation",
  manager: "Meera Shah",
  phone: "+91 90000 22002",
  email: "asha.foundation@foodshare.in",
  facility: "18 CMH Road, Indiranagar, Bengaluru, Karnataka 560038",
};

export const ADMIN_ACCOUNT = { role: "admin" as Role, email: "admin@foodshare.org" };

const baseClaim = (claimedAtText: string): NgoClaim => ({
  org: RECEIVER_ACCOUNT.name,
  contact: RECEIVER_ACCOUNT.manager,
  phone: RECEIVER_ACCOUNT.phone,
  facility: RECEIVER_ACCOUNT.facility,
  email: RECEIVER_ACCOUNT.email,
  claimedAtText,
});

/* ------------------------------ seed ------------------------------- */

const SEED_DONATIONS: Donation[] = [
  {
    id: "FS-1048",
    date: "08 Nov 2026",
    name: "Vegetable rice",
    type: "Veg",
    qty: 40,
    unit: "meals",
    expiryText: "08 Nov 2026, 18:00 IST",
    expiryTime: "18:00",
    status: "available",
    listedAt: "10:10",
    origin: "vendor",
  },
  {
    id: "FS-1047",
    date: "08 Nov 2026",
    name: "Mixed vegetable curry",
    type: "Veg",
    qty: 25,
    unit: "kg",
    expiryText: "08 Nov 2026, 16:00 IST",
    expiryTime: "16:00",
    status: "claimed",
    claimedAt: "10:28",
    pickupBy: "14:00",
    claim: baseClaim("08 Nov 2026, 10:28 IST"),
    origin: "vendor",
  },
  {
    id: "FS-1045",
    date: "08 Nov 2026",
    name: "Chapati packs",
    type: "Veg",
    qty: 80,
    unit: "packets",
    expiryText: "08 Nov 2026, 15:00 IST",
    expiryTime: "15:00",
    status: "picked_up",
    claimedAt: "09:40",
    pickedUpAt: "10:05",
    claim: baseClaim("08 Nov 2026, 09:40 IST"),
    origin: "vendor",
  },
  {
    id: "FS-1041",
    date: "08 Nov 2026",
    name: "Dal",
    type: "Veg",
    qty: 20,
    unit: "litres",
    expiryText: "08 Nov 2026, 14:00 IST",
    expiryTime: "14:00",
    status: "completed",
    claimedAt: "08:55",
    pickedUpAt: "09:20",
    completedAt: "09:45",
    claim: baseClaim("08 Nov 2026, 08:55 IST"),
    receiptConfirmed: true,
    origin: "vendor",
  },
];

const SEED_NEARBY: NearbyItem[] = [
  {
    id: "FS-1048",
    name: "Vegetable rice",
    type: "Veg",
    qty: 40,
    unit: "meals",
    vendor: "Annapurna Kitchen",
    address: "24, 5th Cross, Indiranagar",
    expiryText: "08 Nov, 18:00 IST",
    expiryTime: "18:00",
    code: "FS-1048",
    phone: "+91 90000 12001",
    distanceKm: 0.8,
    x: 52,
    y: 56,
    popupNote: "rear entrance",
  },
  {
    id: "FS-1050",
    name: "Idli & chutney",
    type: "Veg",
    qty: 60,
    unit: "meals",
    vendor: "Sahana Canteen",
    address: "12, 80 Feet Road, Indiranagar",
    expiryText: "08 Nov, 13:00 IST",
    expiryTime: "13:00",
    soon: true,
    code: "FS-1050",
    phone: "+91 90000 12003",
    distanceKm: 1.4,
    x: 30,
    y: 30,
  },
  {
    id: "FS-1051",
    name: "Chicken biryani",
    type: "Non-Veg",
    qty: 15,
    unit: "packets",
    vendor: "City Caterers",
    address: "42, Old Airport Road, Domlur",
    expiryText: "08 Nov, 14:30 IST",
    expiryTime: "14:30",
    code: "FS-1051",
    phone: "+91 90000 12004",
    distanceKm: 2.1,
    x: 70,
    y: 22,
  },
];

const SEED_PENDING: PendingRequest[] = [
  {
    id: "p1",
    kind: "vendor",
    name: "Udupi Meals",
    category: "Restaurant",
    time: "Today, 10:18",
    addr1: "8, 12th Main, Indiranagar",
    addr2: "Bengaluru, Karnataka 560038",
    contactLabel: "Business contact",
    contactName: "Ravi Kumar",
    phone: "+91 90000 31001",
    email: "udupi@example.org",
    evidence: "Trade license",
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "p2",
    kind: "vendor",
    name: "Green Basket Store",
    category: "Grocery",
    time: "Today, 09:41",
    addr1: "6, 80 Feet Road, Indiranagar",
    addr2: "Bengaluru, Karnataka 560038",
    contactLabel: "Business contact",
    contactName: "Naveen Patel",
    phone: "+91 90000 31003",
    email: "basket@example.org",
    evidence: "Trade license",
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "p3",
    kind: "receiver",
    name: "Seva Community Trust",
    category: "Registered NGO",
    time: "Today, 10:02",
    addr1: "31, Cambridge Road, Ulsoor",
    addr2: "Bengaluru, Karnataka 560008",
    contactLabel: "Organization manager",
    contactName: "Anita Das",
    phone: "+91 90000 31002",
    email: "seva@example.org",
    evidence: "NGO registration",
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "p4",
    kind: "receiver",
    name: "Namma Care NGO",
    category: "Registered NGO",
    time: "Today, 09:12",
    addr1: "19, 2nd Main, Domlur",
    addr2: "Bengaluru, Karnataka 560071",
    contactLabel: "Organization manager",
    contactName: "Divya Menon",
    phone: "+91 90000 31004",
    email: "namma@example.org",
    evidence: "NGO registration",
    emailVerified: true,
    phoneVerified: true,
  },
];

const SEED_AUDIT: AuditEntry[] = [
  { id: "a2", tone: "green", badge: "Vendor approved", name: "Annapurna Kitchen", detail: "Approved by service admin · 08:45 IST" },
  { id: "a1", tone: "green", badge: "Receiver approved", name: "Asha Foundation", detail: "Approved by service admin · 09:00 IST" },
];

const SEED_USERS: VerifiedUser[] = [
  { id: "v1", kind: "vendor", name: "Annapurna Kitchen", category: "Restaurant", email: "annapurna.kitchen@foodshare.in", phone: "+91 90000 12001", approvedAt: "08:45 IST" },
  { id: "r1", kind: "receiver", name: "Asha Foundation", category: "NGO", email: "asha.foundation@foodshare.in", phone: "+91 90000 22002", approvedAt: "09:00 IST" },
];

export interface PostFoodInput {
  name: string;
  type: FoodType;
  qty: number;
  unit: string;
  expiry: string; // ISO from datetime-local
  override: boolean;
  street: string;
  city: string;
  pincode: string;
  state: string;
  notes: string;
  confirm: boolean;
}

/* ------------------------------ store ------------------------------ */

interface FSState {
  view: View;
  loginRole: Role;
  session: { role: Role; email: string; name: string } | null;

  donations: Donation[];
  nearby: NearbyItem[];
  pending: PendingRequest[];
  audit: AuditEntry[];
  verifiedUsers: VerifiedUser[];

  claimAlert: string | null;
  nextIdNum: number;
  editingId: string | null;

  vendorTab: "post" | "inventory";
  receiverTab: "find" | "claims";
  adminTab: "dashboard" | "users";
  drawerOpen: boolean;

  vendorFilter: "all" | "available" | "inprogress" | "completed";
  vendorDate: string;
  lastUpdated: string;

  search: string;
  distanceKm: number;
  foodType: string;
  selectedMapId: string | null;

  queueTab: "all" | "vendors" | "receivers";
  queueSearch: string;
  queueRefreshing: boolean;

  regSuccess: { kind: "vendor" | "receiver"; name: string } | null;
  newVendorRegs: number;
  newReceiverRegs: number;
  approvedVendors: number;
  approvedReceivers: number;
  rejectedVendors: number;
  rejectedReceivers: number;

  /* actions */
  go: (v: View) => void;
  goLogin: (role?: Role) => void;
  login: (role: Role, email: string) => void;
  logout: () => void;
  dismissAlert: () => void;

  setDrawer: (open: boolean) => void;
  setVendorTab: (t: "post" | "inventory") => void;
  setReceiverTab: (t: "find" | "claims") => void;
  setAdminTab: (t: "dashboard" | "users") => void;

  setVendorFilter: (f: FSState["vendorFilter"]) => void;
  setVendorDate: (d: string) => void;
  sync: () => void;

  postFood: (input: PostFoodInput) => void;
  startEdit: (id: string) => void;
  cancelEdit: () => void;
  updateListing: (input: PostFoodInput) => void;
  withdraw: (id: string) => void;
  vendorMarkPicked: (id: string) => void;
  vendorMarkCompleted: (id: string) => void;

  setSearch: (s: string) => void;
  setDistance: (km: number) => void;
  setFoodType: (t: string) => void;
  selectOnMap: (id: string | null) => void;
  claimFood: (id: string) => void;
  receiverMarkPicked: (id: string) => void;
  receiverMarkCompleted: (id: string) => void;
  cancelClaim: (id: string) => void;

  setQueueTab: (t: FSState["queueTab"]) => void;
  setQueueSearch: (s: string) => void;
  refreshQueue: () => void;
  approve: (id: string) => void;
  reject: (id: string, reason: string) => void;

  submitVendorReg: (name: string, email: string, phone: string, addr1: string, addr2: string) => void;
  submitReceiverReg: (name: string, email: string, phone: string, addr1: string, addr2: string) => void;
  clearRegSuccess: () => void;
}

export const useFS = create<FSState>((set, get) => ({
  view: "landing",
  loginRole: "vendor",
  session: null,

  donations: SEED_DONATIONS,
  nearby: SEED_NEARBY,
  pending: SEED_PENDING,
  audit: SEED_AUDIT,
  verifiedUsers: SEED_USERS,

  claimAlert: "Mixed vegetable curry was just claimed by Asha Foundation!",
  nextIdNum: 1053,
  editingId: null,

  vendorTab: "post",
  receiverTab: "find",
  adminTab: "dashboard",
  drawerOpen: false,

  vendorFilter: "all",
  vendorDate: "08 Nov 2026",
  lastUpdated: "10:30 IST",

  search: "",
  distanceKm: 3,
  foodType: "all",
  selectedMapId: "FS-1048",

  queueTab: "all",
  queueSearch: "",
  queueRefreshing: false,

  regSuccess: null,
  newVendorRegs: 0,
  newReceiverRegs: 0,
  approvedVendors: 0,
  approvedReceivers: 0,
  rejectedVendors: 0,
  rejectedReceivers: 0,

  go: (v) => set({ view: v, drawerOpen: false }),
  goLogin: (role) => set({ loginRole: role ?? get().loginRole, view: "login", drawerOpen: false }),
  login: (role, email) =>
    set({
      session: {
        role,
        email,
        name: role === "vendor" ? VENDOR_ACCOUNT.name : role === "receiver" ? RECEIVER_ACCOUNT.name : "Service admin",
      },
      view: role === "vendor" ? "vendor-dash" : role === "receiver" ? "receiver-dash" : "admin-dash",
      drawerOpen: false,
    }),
  logout: () => set({ session: null, view: "landing", drawerOpen: false }),
  dismissAlert: () => set({ claimAlert: null }),

  setDrawer: (open) => set({ drawerOpen: open }),
  setVendorTab: (t) => set({ vendorTab: t, drawerOpen: false }),
  setReceiverTab: (t) => set({ receiverTab: t, drawerOpen: false }),
  setAdminTab: (t) => set({ adminTab: t, drawerOpen: false }),

  setVendorFilter: (f) => set({ vendorFilter: f }),
  setVendorDate: (d) => set({ vendorDate: d }),
  sync: () => set({ lastUpdated: clockIST() }),

  postFood: (input) => {
    const s = get();
    const id = `FS-${s.nextIdNum}`;
    const expiryDate = parseIST(input.expiry);
    const expiryText = fmtIST(expiryDate);
    const hhmm = istClock(expiryDate);
    const [hh, mm] = hhmm.split(":");
    const now = new Date(APP_NOW.getTime() + 60_000);
    const donation: Donation = {
      id,
      date: "08 Nov 2026",
      name: input.name,
      type: input.type,
      qty: input.qty,
      unit: input.unit,
      expiryText,
      expiryTime: `${hh}:${mm}`,
      status: "available",
      listedAt: clockIST(now).replace(" IST", ""),
      notes: input.notes || undefined,
      pickupAddress: input.override ? `${input.street}, ${input.city} ${input.pincode}` : undefined,
      origin: "vendor",
    };
    const nearbyItem: NearbyItem = {
      id,
      name: input.name,
      type: input.type,
      qty: input.qty,
      unit: input.unit,
      vendor: VENDOR_ACCOUNT.name,
      address: input.override ? `${input.street}, ${input.city}` : VENDOR_ACCOUNT.address,
      expiryText: fmtShort(expiryDate),
      expiryTime: `${hh}:${mm}`,
      code: id,
      phone: VENDOR_ACCOUNT.phone,
      distanceKm: 0.9,
      x: 40,
      y: 72,
    };
    set({
      donations: [donation, ...s.donations],
      nearby: [...s.nearby, nearbyItem],
      nextIdNum: s.nextIdNum + 1,
      vendorTab: "inventory",
      lastUpdated: clockIST(now).replace(" IST", ""),
    });
  },

  startEdit: (id) => set({ editingId: id, vendorTab: "post" }),
  cancelEdit: () => set({ editingId: null }),
  updateListing: (input) => {
    const s = get();
    const id = s.editingId;
    if (!id) return;
    const expiryDate = parseIST(input.expiry);
    const hhmm = istClock(expiryDate);
    const [hh, mm] = hhmm.split(":");
    set({
      editingId: null,
      vendorTab: "inventory",
      donations: s.donations.map((d) =>
        d.id === id
          ? {
              ...d,
              name: input.name,
              type: input.type,
              qty: input.qty,
              unit: input.unit,
              expiryText: fmtIST(expiryDate),
              expiryTime: `${hh}:${mm}`,
              notes: input.notes || undefined,
              pickupAddress: input.override ? `${input.street}, ${input.city} ${input.pincode}` : undefined,
            }
          : d
      ),
      nearby: s.nearby.map((n) =>
        n.id === id ? { ...n, name: input.name, type: input.type, qty: input.qty, unit: input.unit, expiryText: fmtShort(expiryDate), expiryTime: `${hh}:${mm}` } : n
      ),
    });
  },
  withdraw: (id) => {
    const s = get();
    set({
      donations: s.donations.map((d) => (d.id === id ? { ...d, status: "withdrawn" as DonationStatus } : d)),
      nearby: s.nearby.filter((n) => n.id !== id),
    });
  },
  vendorMarkPicked: (id) => {
    const s = get();
    set({
      donations: s.donations.map((d) =>
        d.id === id ? { ...d, status: "picked_up" as DonationStatus, pickedUpAt: clockIST().replace(" IST", "") } : d
      ),
      lastUpdated: clockIST(),
    });
  },
  vendorMarkCompleted: (id) => {
    const s = get();
    set({
      donations: s.donations.map((d) =>
        d.id === id
          ? { ...d, status: "completed" as DonationStatus, completedAt: clockIST().replace(" IST", ""), receiptConfirmed: true }
          : d
      ),
      lastUpdated: clockIST(),
    });
  },

  setSearch: (search) => set({ search }),
  setDistance: (distanceKm) => set({ distanceKm }),
  setFoodType: (foodType) => set({ foodType }),
  selectOnMap: (selectedMapId) => set({ selectedMapId }),
  claimFood: (id) => {
    const s = get();
    const item = s.nearby.find((n) => n.id === id);
    if (!item) return;
    const now = new Date(APP_NOW.getTime() + 2 * 60_000);
    const claimedAt = clockIST(now).replace(" IST", "");
    const donation: Donation = {
      id: item.id,
      date: "08 Nov 2026",
      name: item.name,
      type: item.type,
      qty: item.qty,
      unit: item.unit,
      expiryText: fmtIST(new Date(`2026-11-08T${item.expiryTime}:00+05:30`)),
      expiryTime: item.expiryTime,
      status: "claimed",
      claimedAt,
      pickupBy: item.expiryTime,
      claim: baseClaim(`08 Nov 2026, ${claimedAt} IST`),
      origin: "nearby",
      nearbyData: item,
    };
    set({
      nearby: s.nearby.filter((n) => n.id !== id),
      donations: s.donations.some((d) => d.id === id)
        ? s.donations.map((d) => (d.id === id ? { ...d, ...donation } : d))
        : [donation, ...s.donations],
      selectedMapId: null,
      claimAlert: `${item.name} was just claimed by ${RECEIVER_ACCOUNT.name}!`,
      lastUpdated: clockIST(now),
    });
  },
  receiverMarkPicked: (id) => {
    const s = get();
    set({
      donations: s.donations.map((d) =>
        d.id === id ? { ...d, status: "picked_up" as DonationStatus, pickedUpAt: clockIST().replace(" IST", "") } : d
      ),
      lastUpdated: clockIST(),
    });
  },
  receiverMarkCompleted: (id) => {
    const s = get();
    set({
      donations: s.donations.map((d) =>
        d.id === id
          ? { ...d, status: "completed" as DonationStatus, completedAt: clockIST().replace(" IST", ""), receiptConfirmed: true }
          : d
      ),
      lastUpdated: clockIST(),
    });
  },
  cancelClaim: (id) => {
    const s = get();
    const d = s.donations.find((x) => x.id === id);
    if (!d) return;
    const restored: NearbyItem =
      d.nearbyData ?? {
        id: d.id,
        name: d.name,
        type: d.type,
        qty: d.qty,
        unit: d.unit,
        vendor: VENDOR_ACCOUNT.name,
        address: VENDOR_ACCOUNT.address,
        expiryText: d.expiryText.replace("08 Nov 2026", "08 Nov"),
        expiryTime: d.expiryTime,
        code: d.id,
        phone: VENDOR_ACCOUNT.phone,
        distanceKm: 0.8,
        x: 52,
        y: 56,
      };
    set({
      donations: s.donations.map((x) =>
        x.id === id ? { ...x, status: "available" as DonationStatus, claim: undefined, claimedAt: undefined, pickupBy: undefined, pickedUpAt: undefined, completedAt: undefined, receiptConfirmed: false, origin: "vendor" as const } : x
      ),
      nearby: s.nearby.some((n) => n.id === id) ? s.nearby : [...s.nearby, restored],
      claimAlert: `Claim cancelled · ${d.name} is available again.`,
    });
  },

  setQueueTab: (queueTab) => set({ queueTab }),
  setQueueSearch: (queueSearch) => set({ queueSearch }),
  refreshQueue: () => {
    set({ queueRefreshing: true });
    setTimeout(() => set({ queueRefreshing: false, lastUpdated: clockIST() }), 700);
  },
  approve: (id) => {
    const s = get();
    const req = s.pending.find((p) => p.id === id);
    if (!req) return;
    set({
      pending: s.pending.filter((p) => p.id !== id),
      approvedVendors: req.kind === "vendor" ? s.approvedVendors + 1 : s.approvedVendors,
      approvedReceivers: req.kind === "receiver" ? s.approvedReceivers + 1 : s.approvedReceivers,
      audit: [
        { id: `a-${id}-${Date.now()}`, tone: "green", badge: `${req.kind === "vendor" ? "Vendor" : "Receiver"} approved`, name: req.name, detail: `Approved by service admin · ${clockIST()}` },
        ...s.audit,
      ],
      verifiedUsers: [
        { id: `u-${id}`, kind: req.kind, name: req.name, category: req.category.replace("Registered ", ""), email: req.email, phone: req.phone, approvedAt: clockIST() },
        ...s.verifiedUsers,
      ],
    });
  },
  reject: (id, reason) => {
    const s = get();
    const req = s.pending.find((p) => p.id === id);
    if (!req) return;
    set({
      pending: s.pending.filter((p) => p.id !== id),
      rejectedVendors: req.kind === "vendor" ? s.rejectedVendors + 1 : s.rejectedVendors,
      rejectedReceivers: req.kind === "receiver" ? s.rejectedReceivers + 1 : s.rejectedReceivers,
      audit: [
        { id: `a-${id}-${Date.now()}`, tone: "red", badge: `${req.kind === "vendor" ? "Vendor" : "Receiver"} rejected`, name: req.name, detail: `Rejected · ${reason} · ${clockIST()}` },
        ...s.audit,
      ],
    });
  },

  submitVendorReg: (name, email, phone, addr1, addr2) => {
    const s = get();
    set({
      pending: [
        {
          id: `p-new-${Date.now()}`,
          kind: "vendor",
          name,
          category: "Restaurant",
          time: "Just now",
          addr1,
          addr2,
          contactLabel: "Business contact",
          contactName: VENDOR_ACCOUNT.owner,
          phone,
          email,
          evidence: "Trade license",
          emailVerified: true,
          phoneVerified: true,
        },
        ...s.pending,
      ],
      newVendorRegs: s.newVendorRegs + 1,
      regSuccess: { kind: "vendor", name },
    });
  },
  submitReceiverReg: (name, email, phone, addr1, addr2) => {
    const s = get();
    set({
      pending: [
        {
          id: `p-new-${Date.now()}`,
          kind: "receiver",
          name,
          category: "Registered NGO",
          time: "Just now",
          addr1,
          addr2,
          contactLabel: "Organization manager",
          contactName: RECEIVER_ACCOUNT.manager,
          phone,
          email,
          evidence: "NGO registration",
          emailVerified: true,
          phoneVerified: true,
        },
        ...s.pending,
      ],
      newReceiverRegs: s.newReceiverRegs + 1,
      regSuccess: { kind: "receiver", name },
    });
  },
  clearRegSuccess: () => set({ regSuccess: null }),
}));
