import HeroProcession from "@/components/home/HeroProcession";
import StackedPortals from "@/components/home/StackedPortals";
import Principal from "@/components/home/Principal";
import Atelier from "@/components/home/Atelier";
import Press from "@/components/home/Press";
import Collaborators from "@/components/home/Collaborators";
import Threshold from "@/components/home/Threshold";

export default function Home() {
  return (
    <>
      <HeroProcession />
      <StackedPortals />
      <Principal />
      <Atelier />
      <Press />
      <Collaborators />
      <Threshold />
    </>
  );
}
