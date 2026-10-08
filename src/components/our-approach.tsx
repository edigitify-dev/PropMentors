"use client";

import Image from "next/image";
import { useApproachTimeline } from "@/hooks/use-approach-timeline";

const steps = [
  { id: "understand", title: "Understand", description: "Your business, requirement and objectives." },
  { id: "identify", title: "Identify", description: "Relevant spaces that match your needs." },
  { id: "evaluate", title: "Evaluate", description: "Compare terms, location, costs and opportunities." },
  { id: "close", title: "Close", description: "Navigate negotiations and move forward confidently." },
];

export function OurApproach() {
  const { trackRef, pinRef, sectionRef, timelineRef, stepsRef } = useApproachTimeline();

  return (
    <div className="approach-scroll-track" ref={trackRef} data-animated="true">
    <div className="approach-pin" ref={pinRef}>
    <section className="our-approach" id="our-approach" ref={sectionRef} aria-labelledby="approach-heading" data-node-id="352:2234">
      <div className="approach-heading">
        <div className="section-badge" data-node-id="352:2235">
          <span className="section-badge-icon" aria-hidden="true"><Image src="/images/glance/badge-star.svg" alt="" width={17} height={17} unoptimized /></span>
          <span>THE PROPMENTORS APPROACH</span>
        </div>
        <div className="approach-heading-row">
          <h2 id="approach-heading"><span>From requirement</span><span>to right-fit space</span></h2>
          <p>Four simple steps to help you move from a business requirement to a space that works.</p>
        </div>
      </div>

      <div className="approach-timeline" ref={timelineRef}>
      <ol className="approach-steps" ref={stepsRef}>
        {steps.map((step, index) => (
          <li className={`approach-step approach-step-${step.id}`} key={step.id} data-active={index === 0} aria-current={index === 0 ? "step" : undefined}>
            <div className="approach-step-visual" aria-hidden="true">
              <div className="approach-icon">
                <div className="approach-icon-artwork">
                  <Image className="approach-circle-base" src="/images/approach/step-circle.svg" alt="" width={64} height={64} loading="eager" unoptimized />
                  <Image className="approach-circle-active" src="/images/approach/active-circle.svg" alt="" width={64} height={64} loading="eager" unoptimized />
                  <div className={`approach-icon-fill approach-icon-fill-${step.id}`}>
                    <Image src={`/images/approach/${index === 0 ? "active" : "step"}-fill.svg`} alt="" width={index === 0 ? 81.0667 : 64} height={index === 0 ? 81.0667 : 64} loading="eager" unoptimized />
                  </div>
                </div>
              </div>
              <div className="approach-stem"><Image src="/images/approach/connector.svg" alt="" width={85} height={1} loading="eager" unoptimized /></div>
              {index === 0 && <div className="approach-dot"><div className="approach-dot-artwork"><Image src="/images/approach/active-dot.svg" alt="" width={18} height={18} loading="eager" unoptimized /></div></div>}
            </div>
            <div className="approach-step-content">
              <h3>{String(index + 1).padStart(2, "0")} - {step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
      </div>
    </section>
    </div>
    </div>
  );
}
