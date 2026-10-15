import type { Metadata } from "next";
import { ProjectHeader } from "@/components/project-header";
import { SiteFooter } from "@/components/site-footer";
import { privacyPolicyNote, privacyPolicySections } from "@/data/privacy-policy";
import styles from "./privacy-policy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | PropMentors",
  description: "Read how PropMentors collects, uses and protects personal information, and how to contact us about privacy requests.",
};

function PolicyText({ text }: { text: string }) {
  return text.split(/(info@propmentors\.in|https:\/\/propmentors\.in)/g).map((part, index) => {
    if (part === "info@propmentors.in") return <a key={index} href={`mailto:${part}`}>{part}</a>;
    if (part === "https://propmentors.in") return <a key={index} href={part}>{part}</a>;
    return part;
  });
}

function PolicyContents() {
  return (
    <ol className={styles.contentsList}>
      {privacyPolicySections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}
    </ol>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className={styles.page}>
      <ProjectHeader />
      <main className={styles.main}>
        <header className={styles.intro}>
          <p>PropMentors</p>
          <h1>Privacy Policy</h1>
        </header>

        <details className={styles.mobileContents}>
          <summary>On this page</summary>
          <nav aria-label="Privacy policy sections"><PolicyContents /></nav>
        </details>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <p>On this page</p>
            <nav aria-label="Privacy policy sections"><PolicyContents /></nav>
          </aside>
          <article className={styles.policy} aria-label="PropMentors Privacy Policy">
            {privacyPolicySections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className={styles.policySection}>
                <h2 id={`${section.id}-heading`}>{section.title}</h2>
                {section.blocks.map((block, index) => {
                  switch (block.type) {
                    case "heading": return <h3 key={index}>{block.text}</h3>;
                    case "paragraph": return <p key={index}><PolicyText text={block.text} /></p>;
                    case "list": return <ul key={index}>{block.items.map((item) => <li key={item}><PolicyText text={item} /></li>)}</ul>;
                    case "details": return <dl key={index} className={styles.businessDetails}>{block.items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd><PolicyText text={item.value} /></dd></div>)}</dl>;
                  }
                })}
              </section>
            ))}
            <p className={styles.policyNote}>{privacyPolicyNote}</p>
          </article>
        </div>
      </main>
      <SiteFooter homePath="/" showCta={false} />
    </div>
  );
}
