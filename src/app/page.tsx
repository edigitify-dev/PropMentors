import { Hero } from "@/components/hero";
import { AtAGlance } from "@/components/at-a-glance";
import { ExploreSpaces } from "@/components/explore-spaces";
import { PropertyOwners } from "@/components/property-owners";
import { WorkspaceOffers } from "@/components/workspace-offers";
import { RealGuidance } from "@/components/real-guidance";
import { OurApproach } from "@/components/our-approach";
import { ClientStories } from "@/components/client-stories";
import { Insights } from "@/components/insights";
import { SiteFooter } from "@/components/site-footer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <AtAGlance />
        <ExploreSpaces />
        <PropertyOwners />
        <WorkspaceOffers />
        <div className={styles.desktopGuidance}>
          <RealGuidance />
        </div>
        <OurApproach />
        <ClientStories />
        <Insights />
      </main>
      <SiteFooter />
    </>
  );
}
