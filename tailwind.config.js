/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "glass-noise":
          "url('data:image/svg+xml;base64,CiAgICAgIDxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpzdmdqcz0iaHR0cDovL3N2Z2pzLmRldi9zdmdqcyIgdmlld0JveD0iMCAwIDcwMCA3MDAiIHdpZHRoPSI3MDAiIGhlaWdodD0iNzAwIiBvcGFjaXR5PSIwLjI4Ij4KICAgICAgICA8ZGVmcz4KICAgICAgICAgIDxmaWx0ZXIgaWQ9Im5ubm9pc2UtZmlsdGVyIiB4PSItMjAlIiB5PSItMjAlIiB3aWR0aD0iMTQwJSIgaGVpZ2h0PSIxNDAlIiBmaWx0ZXJVbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIHByaW1pdGl2ZVVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJsaW5lYXJSR0IiPgogICAgICAgICAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC4xMTYiIG51bU9jdGF2ZXM9IjQiIHNlZWQ9IjE1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIiB4PSIwJSIgeT0iMCUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHJlc3VsdD0idHVyYnVsZW5jZSI+PC9mZVR1cmJ1bGVuY2U+CiAgICAgICAgICAgIDxmZVNwZWN1bGFyTGlnaHRpbmcgc3VyZmFjZVNjYWxlPSIxOCIgc3BlY3VsYXJDb25zdGFudD0iMC43IiBzcGVjdWxhckV4cG9uZW50PSIyMCIgbGlnaHRpbmctY29sb3I9IiM3OTU3QTgiIHg9IjAlIiB5PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgaW49InR1cmJ1bGVuY2UiIHJlc3VsdD0ic3BlY3VsYXJMaWdodGluZyI+CiAgICAgICAgICAgICAgPGZlRGlzdGFudExpZ2h0IGF6aW11dGg9IjMiIGVsZXZhdGlvbj0iMTAwIj48L2ZlRGlzdGFudExpZ2h0PgogICAgICAgICAgICA8L2ZlU3BlY3VsYXJMaWdodGluZz4KICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIgeD0iMCUiIHk9IjAlIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBpbj0ic3BlY3VsYXJMaWdodGluZyIgcmVzdWx0PSJjb2xvcm1hdHJpeCI+PC9mZUNvbG9yTWF0cml4PgogICAgICAgICAgPC9maWx0ZXI+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxyZWN0IHdpZHRoPSI3MDAiIGhlaWdodD0iNzAwIiBmaWxsPSJ0cmFuc3BhcmVudCI+PC9yZWN0PgogICAgICAgIDxyZWN0IHdpZHRoPSI3MDAiIGhlaWdodD0iNzAwIiBmaWx0ZXI9InVybCgjbm5ub2lzZS1maWx0ZXIpIj48L3JlY3Q+CiAgICAgIDwvc3ZnPgogICAg')",
      },
      backdropBlur: {
        32: "32px",
      },
      backdropSaturate: {
        180: "180%",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
        "glass-sm": "0 4px 16px rgba(0, 0, 0, 0.3)",
        "glass-lg": "0 12px 48px rgba(0, 0, 0, 0.5)",
        "glass-shine":
          "inset 1px 1px 1px 0 rgba(255, 255, 255, 0.2), inset -1px -1px 2px 0 rgba(0, 0, 0, 0.2)",
        "glass-active":
          "0 8px 32px rgba(0, 0, 0, 0.35), 0 0 0 2px rgba(96, 165, 250, 0.5)",
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".liquid-glass": {
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.5)",
        },
        ".glass-effect": {
          position: "absolute",
          inset: "0",
          zIndex: "1", // idk why i had to do important?
          backdropFilter: "blur(80px) saturate(200%) !important",
          WebkitBackdropFilter: "blur(80px) saturate(200%) !important",

          backgroundColor: "rgba(0,0,0,0.01)",

          filter: "url(#glass-distortion)",
          isolation: "isolate",
        },

        ".glass-tint": {
          position: "absolute",
          inset: "0",
          zIndex: "2",
          backgroundImage:
            "linear-gradient(to top right, rgba(30, 25, 25, 0.4), rgba(30, 25, 25, 0.2))",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "background-image 0.5s ease, border-color 0.5s ease",
        },
        ".glass-shine": {
          position: "absolute",
          inset: "0",
          zIndex: "3",
          boxShadow:
            "inset 1px 1px 1px 0 rgba(255, 255, 255, 0.2), inset -1px -1px 2px 0 rgba(0, 0, 0, 0.2)",
        },
        ".glass-content": {
          position: "relative",
          zIndex: "4",
          height: "100%",
          width: "100%",
        },
        ".simple-glass": {
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          backgroundColor: "rgba(30, 25, 25, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
          transition: "background-color 0.5s ease, border-color 0.5s ease",
        },
      });
    },
  ],
};
