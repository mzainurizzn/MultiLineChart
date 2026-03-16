import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import LogoWings from '../assets/logo.png';

type MenuChild = {
  key: string;
  label: string;
  to: string;
};

type MenuItem = {
  key: string;
  label: string;
  to?: string;
  children?: MenuChild[];
};

const menus: MenuItem[] = [
  { key: "plants", label: "Machine Speed", to: "/" },
  { key: "", label: "Weight Checker", to: "/weightchecker" }
];

export default function MainLayout() {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const activePath = location.pathname;

  // ===== theme (samakan dengan Plants page) =====
  const pageBg = "#0b1220";
  const cardBg = "#0f1b2d";
  const primary = "#1581BF";
  const subtle = "#ffffffb3";

  const defaultExpanded = React.useMemo<Record<string, boolean>>(() => {
    const expanded: Record<string, boolean> = {};
    for (const m of menus) {
      if (m.children?.some((c) => activePath.startsWith(c.to))) {
        expanded[m.key] = true;
      }
    }
    return expanded;
  }, [activePath]);

  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(
    defaultExpanded
  );

  React.useEffect(() => {
    setExpanded((prev) => ({ ...prev, ...defaultExpanded }));
  }, [defaultExpanded]);

  const toggleExpand = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      className="min-h-screen flex justify-center p-3"
      style={{ background: pageBg }}
    >
      {/* parent ukuran mobile */}
      <div
        className="w-full max-w-[900px] rounded-2xl shadow overflow-hidden border"
        style={{ background: pageBg, borderColor: "#ffffff14" }}
      >
        {/* Top Bar */}
        <div
          className="h-14 px-4 flex items-center justify-between border-b"
          style={{ background: cardBg, borderColor: "#ffffff14" }}
        >
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border hover:opacity-90"
            style={{ borderColor: "#ffffff14", background: "#ffffff0a" }}
            aria-label="Open menu"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.9"
              />
            </svg>
          </button>

          <div className="text-base font-extrabold text-white">Dashboard Monitoring PT.AMG</div>

          <div className="flex items-center gap-2">
            <img 
            src={LogoWings} alt="Wings" 
            className="h-7 w-7 rounded-md object-contain"
            />
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </div>

        {/* Drawer */}
        <div
          className={[
            "fixed inset-0 z-50 transition",
            open ? "pointer-events-auto" : "pointer-events-none",
          ].join(" ")}
        >
          {/* overlay */}
          <div
            className={[
              "absolute inset-0 transition-opacity",
              open ? "opacity-100" : "opacity-0",
            ].join(" ")}
            style={{ background: "rgba(0,0,0,0.55)" }}
            onClick={() => setOpen(false)}
          />

          {/* drawer panel */}
          <aside
            className={[
              "absolute left-0 top-0 h-full w-[280px] shadow-xl transition-transform border-r",
              open ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
            style={{ background: cardBg, borderColor: "#ffffff14" }}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="h-14 px-4 flex items-center justify-between border-b"
              style={{ borderColor: "#ffffff14" }}
            >
              <div className="font-extrabold text-white">Menu</div>
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-xl border hover:opacity-90"
                style={{ borderColor: "#ffffff14", background: "#ffffff0a" }}
                aria-label="Close menu"
                type="button"
              >
                <span className="text-white">✕</span>
              </button>
            </div>

            <nav className="p-3">
              {menus.map((m) => {
                const hasChildren = !!m.children?.length;

                if (!hasChildren && m.to) {
                  return (
                    <NavLink
                      key={m.key}
                      to={m.to}
                      onClick={() => setOpen(false)}
                      end
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 px-3 py-3 rounded-xl text-sm border transition mt-3",
                          isActive ? "text-white" : "text-white/80",
                        ].join(" ")
                      }
                      style={({ isActive }) => ({
                        background: isActive ? `${primary}22` : "#ffffff0a",
                        borderColor: isActive ? `${primary}44` : "#ffffff14",
                      })}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: isActivePath(m.to, activePath) ? primary : "#ffffff55" }}
                      />
                      {m.label}
                    </NavLink>
                  );
                }

                const isExpanded = !!expanded[m.key];

                return (
                  <div key={m.key} className="mb-2">
                    <button
                      onClick={() => toggleExpand(m.key)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm border text-white/80 transition"
                      style={{ background: "#ffffff0a", borderColor: "#ffffff14" }}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: "#ffffff55" }}
                        />
                        {m.label}
                      </div>
                      <span
                        className={[
                          "transition-transform text-white/70",
                          isExpanded ? "rotate-90" : "rotate-0",
                        ].join(" ")}
                      >
                        ▶
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="pl-3 mt-2 space-y-2">
                        {m.children?.map((c) => (
                          <NavLink
                            key={c.key}
                            to={c.to}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                              [
                                "block px-3 py-2 rounded-xl text-sm border transition",
                                isActive ? "text-white" : "text-white/70",
                              ].join(" ")
                            }
                            style={({ isActive }) => ({
                              background: isActive ? `${primary}22` : "#ffffff08",
                              borderColor: isActive ? `${primary}44` : "#ffffff14",
                            })}
                          >
                            {c.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="p-3 mt-auto">
              <div className="text-xs" style={{ color: subtle }}>
                © Wings - AMG {new Date().getFullYear()}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// helper kecil supaya dot ikut aktif juga
function isActivePath(to: string, current: string) {
  if (to === "/") return current === "/";
  return current.startsWith(to);
}
