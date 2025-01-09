import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  {
    path: "api/files",
    file: "routes/api.files.ts",
    loader: "routes/api.files.ts",
  },
  {
    path: "api/file-content",
    file: "routes/api.file-content.ts",
    loader: "routes/api.file-content.ts",
  },
  {
    path: "api/packages",
    file: "routes/api.packages.ts",
    loader: "routes/api.packages.ts",
  },
] satisfies RouteConfig;
