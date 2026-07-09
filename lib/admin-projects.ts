export type AdminProject = {
  /** Stable id used for sidebar navigation. */
  id: string;
  /** Human-facing project name shown in the sidebar and section header. */
  name: string;
  /** Display domain shown under the shortcut button. */
  domain: string;
  /** Full admin login URL. Opened in a new tab; the target site asks for its own password. */
  adminUrl: string;
  /** Short Turkish description shown in the project section. */
  description: string;
};

/**
 * External projects reachable from this admin panel.
 *
 * Each entry becomes its own section in the left sidebar. Clicking "Admin panelini aç"
 * opens the target admin login in a new tab, where that project requires its own password.
 * To change an address later, just edit the `adminUrl` below.
 */
export const adminProjects: AdminProject[] = [
  {
    id: "shamanlife",
    name: "Shaman Life",
    domain: "shamanlife.com",
    adminUrl: "https://shamanlife.com/en/admin/login",
    description: "Shaman Life admin paneline hızlı geçiş."
  },
  {
    id: "qualtronsinclair",
    name: "Qualtron Sinclair",
    domain: "qualtronsinclair.com",
    adminUrl: "https://www.qualtronsinclair.com/admin/login",
    description: "Qualtron Sinclair admin paneline hızlı geçiş."
  },
  {
    id: "humanconsciousnessdecoded",
    name: "Human Consciousness Decoded",
    domain: "humanconsciousnessdecoded.com",
    adminUrl: "https://humanconsciousnessdecoded.com/admin/login?return=%2Fadmin",
    description: "Human Consciousness Decoded admin paneline hızlı geçiş."
  },
  {
    id: "payaltr",
    name: "PayAL",
    domain: "payaltr.com",
    adminUrl: "https://payaltr.com/admin/giris?next=%2Fadmin",
    description: "PayAL admin paneline hızlı geçiş."
  }
];
