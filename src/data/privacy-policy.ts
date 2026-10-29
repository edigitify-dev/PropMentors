export type PrivacyPolicyBlock =
  | { type: "paragraph" | "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "details"; items: { label: string; value: string }[] };

export type PrivacyPolicySection = {
  id: string;
  title: string;
  blocks: PrivacyPolicyBlock[];
};

export const privacyPolicySections: PrivacyPolicySection[] = [
  {
    "id": "section-1",
    "title": "1. Introduction",
    "blocks": [
      {
        "type": "paragraph",
        "text": "PropMentors (registered trade name: Propmentors) is a managed real estate consultancy operated by Rakesh Chand as a sole proprietorship registered in India. This Privacy Policy explains how personal information may be collected and used when you visit our website, enquire about managed office spaces, submit lead forms, contact us, or interact with our advertisements. Where applicable law requires consent, we seek it separately."
      },
      {
        "type": "heading",
        "text": "Business Information"
      },
      {
        "type": "details",
        "items": [
          {
            "label": "Trade Name",
            "value": "Propmentors"
          },
          {
            "label": "Legal Proprietor",
            "value": "Rakesh Chand"
          },
          {
            "label": "Business Type",
            "value": "Sole Proprietorship"
          },
          {
            "label": "GSTIN",
            "value": "07BPFPS5698R2ZK"
          },
          {
            "label": "Primary Office / Headquarters",
            "value": "G.F.C Business Centre, Middle Circle, H Block, Connaught Place, New Delhi – 110001, India."
          },
          {
            "label": "GST-Registered Business Address",
            "value": "23/196 F/F, Trilokpuri Road, Mayur Vihar Phase 1, New Delhi, Delhi – 110091, India."
          },
          {
            "label": "Email",
            "value": "info@propmentors.in"
          }
        ]
      }
    ]
  },
  {
    "id": "section-2",
    "title": "2. Information We Collect",
    "blocks": [
      {
        "type": "heading",
        "text": "2.1 Personal and Contact Information"
      },
      {
        "type": "list",
        "items": [
          "Name, email address, mobile or telephone number",
          "Company or organisation name, professional designation (where provided), and communication preferences"
        ]
      },
      {
        "type": "heading",
        "text": "2.2 Managed Property Requirements"
      },
      {
        "type": "list",
        "items": [
          "Preferred location, workspace type, number of seats, required area in square feet",
          "Rental budget or rate per square foot, expected move-in date, furnishing and infrastructure needs",
          "Lease preferences and other information voluntarily provided"
        ]
      },
      {
        "type": "heading",
        "text": "2.3 Website and Technical Information"
      },
      {
        "type": "paragraph",
        "text": "Depending on technologies actually implemented and consent choices, this may include IP address, browser, device and operating system, pages visited, engagement events, referral sources, approximate location, cookies and advertising identifiers, and conversion events such as form submissions or contact-button clicks."
      },
      {
        "type": "heading",
        "text": "2.4 Communications"
      },
      {
        "type": "paragraph",
        "text": "We may retain relevant enquiry details and correspondence needed to respond and manage customer relationships. Please avoid sending unnecessary sensitive personal information."
      }
    ]
  },
  {
    "id": "section-3",
    "title": "3. How We Collect Information",
    "blocks": [
      {
        "type": "list",
        "items": [
          "Website enquiry, contact and consultation forms",
          "Phone, email, WhatsApp and direct conversations",
          "Lead generation forms on advertising platforms, including Google, Meta, LinkedIn, ChatGPT or other platforms if used",
          "Website analytics, cookies, pixels and tags where implemented and permitted",
          "Property consultations, quotations and site visit discussions"
        ]
      }
    ]
  },
  {
    "id": "section-4",
    "title": "4. How We Use Information",
    "blocks": [
      {
        "type": "list",
        "items": [
          "Respond to enquiries and understand workspace requirements",
          "Identify suitable properties and provide property details, availability and quotations",
          "Arrange consultations and site visits and communicate about existing enquiries",
          "Manage internal lead records and business operations",
          "Improve website usability and understand traffic and visitor interactions",
          "Measure advertising performance and conversions, and conduct permitted audience analysis or remarketing",
          "Send promotional communications only where legally permitted and appropriately authorised",
          "Meet legal and regulatory obligations"
        ]
      },
      {
        "type": "paragraph",
        "text": "We will assess additional uses and obtain further consent where required."
      }
    ]
  },
  {
    "id": "section-5",
    "title": "5. Consent and Communication Preferences",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Submitting an enquiry allows us to respond to that request subject to applicable law. Where required, we will provide notice and seek consent for the relevant processing. We may contact you by phone, email or WhatsApp regarding your enquiry, including property options, quotations and site visits. Optional promotional messages will be handled separately where required. You may opt out of promotional communications or withdraw consent for consent-based processing by writing to info@propmentors.in, subject to lawful exceptions. Withdrawal does not invalidate earlier lawful processing."
      }
    ]
  },
  {
    "id": "section-6",
    "title": "6. Advertising, Analytics and Marketing Technologies",
    "blocks": [
      {
        "type": "paragraph",
        "text": "PropMentors may use Google Ads, Meta Ads (Facebook and Instagram), LinkedIn Ads, ChatGPT Ads, other digital advertising platforms, analytics services, marketing automation and AI-assisted tools. Naming a platform does not mean every feature is enabled or that a particular integration currently exists."
      },
      {
        "type": "list",
        "items": [
          "Measure impressions, clicks, visits, enquiries and conversion events",
          "Analyse marketing channel performance and aggregated website activity",
          "Create advertising audiences and carry out permitted remarketing",
          "Optimise campaigns, reporting, creative and budgets using automated or AI-assisted tools"
        ]
      },
      {
        "type": "paragraph",
        "text": "New tools or materially different processing will be reviewed for disclosure, consent and data protection requirements before use."
      }
    ]
  },
  {
    "id": "section-7",
    "title": "7. Cookies, Pixels and Similar Technologies",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Our website may use cookies, pixels and tags to support website analytics, advertising measurement and user experience, subject to actual implementation and applicable consent requirements."
      },
      {
        "type": "heading",
        "text": "7.1 Google Analytics 4"
      },
      {
        "type": "paragraph",
        "text": "May measure traffic, engagement, pages and events."
      },
      {
        "type": "heading",
        "text": "7.2 Google Ads"
      },
      {
        "type": "paragraph",
        "text": "May measure advertising conversions and support permitted remarketing."
      },
      {
        "type": "heading",
        "text": "7.3 Meta Pixel"
      },
      {
        "type": "paragraph",
        "text": "May measure Facebook and Instagram advertising interactions and website conversions."
      },
      {
        "type": "heading",
        "text": "7.4 LinkedIn Insight Tag"
      },
      {
        "type": "paragraph",
        "text": "May measure LinkedIn advertising performance and relevant website engagement."
      },
      {
        "type": "heading",
        "text": "7.5 Google Tag Manager"
      },
      {
        "type": "paragraph",
        "text": "May manage the deployment of tags; data processed depends on the tags configured."
      },
      {
        "type": "heading",
        "text": "7.6 Future Technologies"
      },
      {
        "type": "paragraph",
        "text": "Additional technologies will be reviewed before deployment where they materially change data processing."
      },
      {
        "type": "heading",
        "text": "7.7 Managing Cookies"
      },
      {
        "type": "paragraph",
        "text": "You can manage or block cookies through your browser settings. A dedicated cookie consent interface is not currently available on our website; we intend to introduce one in the future. Where consent is required for non-essential analytics or advertising technologies, we will obtain it before activating those technologies. Disabling cookies may affect some website features."
      }
    ]
  },
  {
    "id": "section-8",
    "title": "8. AI-Assisted Marketing and Automation",
    "blocks": [
      {
        "type": "paragraph",
        "text": "AI and automated software may be used for campaign analysis, optimisation recommendations, marketing content, reporting and internal workflows. Use of AI does not automatically authorise disclosure of identifiable customer information. If personal data is processed through a third-party AI service, applicable privacy, security and consent requirements will apply."
      }
    ]
  },
  {
    "id": "section-9",
    "title": "9. Sharing and Disclosure of Information",
    "blocks": [
      {
        "type": "paragraph",
        "text": "PropMentors manages customer enquiries internally. We do not share customer contact details or personal enquiry information with property owners, developers, landlords, coworking operators or other property partners without the customer’s consent, except where disclosure is otherwise permitted or required by law. When a property transaction is finalised, information necessary to complete or administer the transaction may be shared with relevant parties only where the customer has been appropriately informed and a valid legal basis exists; finalisation alone does not authorise unrestricted disclosure. Information may also be processed by service providers supporting website hosting, analytics, advertising, Google Sheets-based lead management, communications, and future CRM systems, subject to applicable law and appropriate arrangements. We do not sell customer contact information to property partners."
      }
    ]
  },
  {
    "id": "section-10",
    "title": "10. Data Storage and Security",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Lead enquiry records are currently managed using Google Sheets. We may move these records to a customer relationship management (CRM) system in the future. We seek to restrict access to authorised personnel and protect information against unauthorised access, misuse, alteration, disclosure or loss. Security controls depend on the systems and providers used; no electronic transmission or storage is completely secure. We will respond to personal data breaches in accordance with applicable law."
      }
    ]
  },
  {
    "id": "section-11",
    "title": "11. Data Retention",
    "blocks": [
      {
        "type": "paragraph",
        "text": "We retain lead information for up to 12 months from the last meaningful interaction relating to an enquiry, unless a shorter period is appropriate or longer retention is required or permitted for ongoing services, accounting, regulatory requirements, disputes or another lawful reason. This policy applies to lead records held in Google Sheets and, if adopted, a future CRM. Requests for erasure are assessed under applicable law. Information is deleted or anonymised when its applicable retention period ends."
      }
    ]
  },
  {
    "id": "section-12",
    "title": "12. Your Privacy Rights",
    "blocks": [
      {
        "type": "list",
        "items": [
          "Request information about personal data processed, subject to applicable law",
          "Request correction or updating of inaccurate data",
          "Request erasure and withdraw consent where applicable",
          "Raise privacy grievances and exercise other statutory rights, including nomination rights where available"
        ]
      },
      {
        "type": "paragraph",
        "text": "Contact info@propmentors.in. We may verify identity where appropriate and will respond in accordance with applicable requirements and timelines."
      }
    ]
  },
  {
    "id": "section-13",
    "title": "13. Marketing Communications",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Enquiry-related communications may include property recommendations, availability, rental quotations, consultation arrangements and site visit coordination. Separate promotional campaigns, newsletters or unrelated offers will be sent only where legally permitted and consistent with consent preferences. Requests to stop optional promotional messages may be sent to info@propmentors.in or through an available opt-out method."
      }
    ]
  },
  {
    "id": "section-14",
    "title": "14. Third-Party Advertising Platforms",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Advertising platforms, including search engines, social networks and AI-based advertising environments, may independently collect and process information under their own privacy policies. PropMentors is responsible for information it receives and processes for its purposes, subject to applicable law. Users should review relevant platform privacy settings."
      }
    ]
  },
  {
    "id": "section-15",
    "title": "15. International Data Processing",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Some advertising, analytics or technology providers may process or store information outside India. Any international processing or transfers of personal data are subject to applicable Indian data protection requirements and restrictions."
      }
    ]
  },
  {
    "id": "section-16",
    "title": "16. Children’s Privacy",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Our services are intended for adults and business representatives and are not directed to people under 18. We do not knowingly solicit children’s personal information. If such data is identified without an appropriate legal basis or required parental consent, appropriate action will be taken under applicable law."
      }
    ]
  },
  {
    "id": "section-17",
    "title": "17. Third-Party Websites and External Links",
    "blocks": [
      {
        "type": "paragraph",
        "text": "Our website may link to property listings, social platforms or other independent services. Those websites operate under their own privacy policies, which visitors should review before submitting information."
      }
    ]
  },
  {
    "id": "section-18",
    "title": "18. Changes to This Privacy Policy",
    "blocks": [
      {
        "type": "paragraph",
        "text": "We may revise this policy as our services, technology, operations or applicable law change. The latest version will be published on our website. Additional notice or consent will be provided where legally required."
      }
    ]
  },
  {
    "id": "section-19",
    "title": "19. Applicable Law",
    "blocks": [
      {
        "type": "paragraph",
        "text": "This policy is intended to operate in accordance with applicable laws of India, including relevant provisions of the Information Technology Act, 2000, applicable rules, and the Digital Personal Data Protection Act, 2023 and related rules as they become applicable. Nothing here restricts statutory rights or remedies."
      }
    ]
  },
  {
    "id": "section-20",
    "title": "20. Contact Information and Grievance Redressal",
    "blocks": [
      {
        "type": "paragraph",
        "text": "PropMentors"
      },
      {
        "type": "details",
        "items": [
          {
            "label": "Registered Trade Name",
            "value": "Propmentors"
          },
          {
            "label": "Legal Proprietor",
            "value": "Rakesh Chand"
          },
          {
            "label": "Business Type",
            "value": "Sole Proprietorship"
          },
          {
            "label": "GSTIN",
            "value": "07BPFPS5698R2ZK"
          },
          {
            "label": "Email",
            "value": "info@propmentors.in"
          },
          {
            "label": "Primary Office / Headquarters",
            "value": "G.F.C Business Centre, Middle Circle, H Block, Connaught Place, New Delhi – 110001, India."
          },
          {
            "label": "GST-Registered Business Address",
            "value": "23/196 F/F, Trilokpuri Road, Mayur Vihar Phase 1, New Delhi, Delhi – 110091, India."
          },
          {
            "label": "Privacy / Grievance Contact Email",
            "value": "info@propmentors.in"
          },
          {
            "label": "Official Website",
            "value": "https://propmentors.in"
          }
        ]
      },
      {
        "type": "paragraph",
        "text": "Privacy requests and grievances sent to info@propmentors.in are monitored by an authorised representative and will be handled in accordance with applicable law."
      }
    ]
  }
];

export const privacyPolicyNote = "PropMentors  |  Privacy Policy  |  Draft for legal review";
