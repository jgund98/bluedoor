import HeroProcession from "@/components/home/HeroProcession";
import StackedPortals from "@/components/home/StackedPortals";
import WhatWeDo from "@/components/home/WhatWeDo";
import Atelier from "@/components/home/Atelier";
import Films from "@/components/home/Films";
import Press from "@/components/home/Press";
import Collaborators from "@/components/home/Collaborators";
import Threshold from "@/components/home/Threshold";

export default function Home() {
  return (
    <>
      <HeroProcession />
      <StackedPortals />
      <WhatWeDo />
      <Atelier />
      <Films />
      <Press />
      <Collaborators />
      <Threshold />
    </>
  );
}
