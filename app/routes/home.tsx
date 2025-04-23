import type { Route } from "./+types/home";
import Layout from "../components/Layout/Layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Circuit Smith" },
    { name: "ToolKit for DIY Circuits", content: "Welcome to Circuit Smith!" },
  ];
}

export default function Home() {
  return <Layout />;
}
