"use client";

import Image from "next/image";
import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { ChevronLeft, PlayCircle } from "@/components/icons";

const stories = [
  { id: "markets", image: "market.png", width: 1199, height: 798, crop: "market", node: "362:2731", quote: "Across key markets and ", emphasis: "discover opportunities", ending: " tailored to your investment goals." },
  { id: "presence", image: "presence.png", width: 824, height: 1288, crop: "presence", node: "362:2710", quote: "Navigate our presence across key markets and ", emphasis: "discover opportunities.", ending: "" },
  { id: "client", image: "client.png", width: 824, height: 1420, crop: "client", node: "362:2738", quote: "PropMentors understood exactly what we needed and helped us find the right space.", emphasis: "", ending: "", credit: "— Name", designation: "Company / Designation" },
  { id: "investment", image: "market.png", width: 1199, height: 798, crop: "market", node: "362:2724", quote: "Across key markets and ", emphasis: "discover opportunities", ending: " tailored to your investment goals." },
  { id: "opportunities", image: "opportunities.png", width: 1200, height: 675, crop: "opportunities", node: "362:2717", quote: "Navigate our presence across key markets and ", emphasis: "discover opportunities.", ending: "" },
];

// Center positions from the five-card Figma rail, relative to the selected card.
const positions = [-825.5, -412.929, 0, 412.882, 825.5];

export function ClientStories() {
  const [active, setActive] = useState(2);
  const move = (direction: number) => setActive(current => (current + direction + stories.length) % stories.length);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  };

  return (
    <section className="client-stories" id="client-stories" aria-labelledby="stories-heading" data-node-id="362:2705">
      <div className="stories-heading">
        <div className="section-badge" data-node-id="362:2755">
          <span className="section-badge-icon" aria-hidden="true"><Image src="/images/glance/badge-star.svg" alt="" width={17} height={17} unoptimized /></span>
          <span>CLIENT STORIES</span>
        </div>
        <div className="stories-heading-row">
          <h2 id="stories-heading">Trusted by businesses making their next move</h2>
          <p>Explore our portfolio of successful projects and hear from the people who put their trust in PropMentors.</p>
        </div>
      </div>

      <div className="stories-carousel" role="region" aria-roledescription="carousel" aria-label="Client testimonials" onKeyDown={onKeyDown}>
        <div className="stories-stage">
          {stories.map((story, index) => {
            const offset = (index - active + stories.length + 2) % stories.length - 2;
            const selected = index === active;
            const style = { "--story-position": `${positions[offset + 2] / 14.4}cqw`, "--story-mobile-position": offset } as CSSProperties;
            return (
              <article className={`story-card story-card-${story.crop}`} data-active={selected} style={style} key={story.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${stories.length}`} aria-hidden={!selected} data-node-id={story.node}>
                <div className="story-mask" aria-hidden="true">
                  <Image src={`/images/stories/${story.image}`} alt="" width={story.width} height={story.height} unoptimized />
                  <div className="story-tint" />
                </div>
                <blockquote className="story-quote">“{story.quote}<strong>{story.emphasis}</strong>{story.ending}”</blockquote>
                {story.credit && <p className="story-credit">{story.credit}<br />{story.designation}</p>}
                {selected && <span className="story-play" aria-hidden="true"><PlayCircle /></span>}
              </article>
            );
          })}
        </div>
        <div className="stories-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous client story"><span><ChevronLeft /></span></button>
          <button type="button" onClick={() => move(1)} aria-label="Next client story"><span><ChevronLeft /></span></button>
        </div>
        <p className="stories-status" aria-live="polite" aria-atomic="true">Client story {active + 1} of {stories.length}: {stories[active].quote}{stories[active].emphasis}{stories[active].ending}</p>
      </div>
    </section>
  );
}
