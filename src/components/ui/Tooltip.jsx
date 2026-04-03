import { useState } from "react";

export default function Tooltip({ content, children, position = "bottom" }) {
  const [visible, setVisible] = useState(false);

  const placementStyle =
    position === "bottom"
      ? {
          top: "calc(100% + 10px)",
          left: "50%",
          transform: "translateX(-50%)",
        }
      : {
          bottom: "calc(100% + 10px)",
          left: "50%",
          transform: "translateX(-50%)",
        };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}

      {visible ? (
        <div
          className="pointer-events-none absolute z-30 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium"
          style={{
            ...placementStyle,
            background: "rgba(15, 23, 42, 0.96)",
            color: "#f8fafc",
            border: "1px solid rgba(148, 163, 184, 0.22)",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.22)",
            backdropFilter: "blur(16px)",
          }}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
}
