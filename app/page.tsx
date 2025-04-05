import Content from "@/ui/components/Content";
import NavBar from "@/ui/components/NavBar";

export default function Home() {
  return (
    <div className="relative h-screen bg-[url(/background/backgroundpoly.png)] bg-cover bg-center">
      {/* Blur Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <NavBar />
        <Content />
      </div>
    </div>
  );
}
