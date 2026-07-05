import {
  type HomepageSection,
  type Insight,
  type MediaAsset,
  type Publication,
  type SiteSettings,
  type SiteSnapshot,
  type TimelineEntry,
  type Venture
} from "@/lib/site-types";

export const defaultSiteSettings: SiteSettings = {
  domain: "https://burakakcakanat.com.tr",
  seoTitle: {
    tr: "Burak Akçakanat | Stratejik Girişim Mimarı",
    en: "Burak Akçakanat | Strategic Venture Architect"
  },
  seoDescription: {
    tr: "Burak Akçakanat'ın venture architecture, leadership intelligence ve GCC-Türkiye odaklı büyüme stratejilerini anlatan premium kişisel sitesi.",
    en: "A premium personal platform presenting Burak Akçakanat's venture architecture, leadership intelligence, and GCC-Turkiye growth strategy work."
  },
  heroEyebrow: {
    tr: "Doha, Dubai ve İstanbul arasında kurulan yüksek etkili iş mimarisi",
    en: "High-impact business architecture shaped across Doha, Dubai, and Istanbul"
  },
  heroTitle: {
    tr: "Kuruculuk, kategori inşası ve sistemik büyümeyi tek bir çatı altında ölçekleyen bir liderlik pratiği.",
    en: "A leadership practice scaling founder vision, category creation, and systemic growth under one roof."
  },
  heroBody: {
    tr: "35 yılı aşan girişimcilik, yatırım hazırlığı ve liderlik dönüşümü deneyimiyle; çok sektörlü varlık yapıları, diaspora platformları ve yeni nesil yatırım ağları tasarlıyorum.",
    en: "With more than 35 years across entrepreneurship, investment readiness, and leadership transformation, I design multi-sector asset platforms, diaspora ecosystems, and next-generation investment networks."
  },
  heroRibbon: {
    tr: "Founder | Qualtron Sinclair | Category Builder",
    en: "Founder | Qualtron Sinclair | Category Builder"
  },
  primaryCta: {
    label: {
      tr: "Stratejik Ortaklık Talebi",
      en: "Request Strategic Partnership"
    },
    href: "#connect"
  },
  secondaryCta: {
    label: {
      tr: "Venture Ekosistemini Keşfet",
      en: "Explore Venture Ecosystem"
    },
    href: "#ventures"
  },
  tertiaryCta: {
    label: {
      tr: "Yönetim Paneli",
      en: "Admin Console"
    },
    href: "/admin"
  },
  contactEmail: "burakakcakanat@hotmail.com",
  contactPhone: "+90 532 436 29 09",
  baseLocation: {
    tr: "Doha merkezli, Dubai ve İstanbul bağlantılı",
    en: "Based in Doha, connected across Dubai and Istanbul"
  },
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/burakakcakanat",
    qualtron: "https://www.qualtronsinclair.com/",
    corteqs: "https://corteqs.net/",
    payal: "https://payaltr.com/",
    hcd: "https://www.humanconsciousnessdecoded.com"
  },
  globalStats: [
    {
      label: { tr: "Yıllık tecrübe", en: "Years of experience" },
      value: "35+"
    },
    {
      label: { tr: "Odak pazar", en: "Core regions" },
      value: "GCC · Türkiye · MENA"
    },
    {
      label: { tr: "Aktif executive ağı", en: "Active executive network" },
      value: "180+"
    }
  ],
  trustBadges: [
    {
      tr: "Venture Architecture",
      en: "Venture Architecture"
    },
    {
      tr: "Leadership Pattern Intelligence",
      en: "Leadership Pattern Intelligence"
    },
    {
      tr: "AI-Driven Business Modeling",
      en: "AI-Driven Business Modeling"
    }
  ]
};

export const defaultHomepageSections: HomepageSection[] = [
  {
    id: "manifesto",
    slug: "manifesto",
    orderIndex: 0,
    published: true,
    eyebrow: {
      tr: "Stratejik Çerçeve",
      en: "Strategic Frame"
    },
    title: {
      tr: "İşleri sadece büyütmek için değil, daha yüksek bir açıklık ve etik doğrulukla çalışacak şekilde tasarlıyorum.",
      en: "I do not just scale businesses. I design them to operate with higher clarity, ethical precision, and strategic endurance."
    },
    body: {
      tr: "Yaklaşımım; kurucu vizyonunu, pazar sinyallerini ve organizasyonel ritmi tek bir karar sistemine dönüştürmek üzerine kurulu.",
      en: "My approach turns founder vision, market signals, and organizational rhythm into a single decision system."
    },
    callout: {
      tr: "Uzun vadeli değer, doğru yapı kurulduğunda ortaya çıkar.",
      en: "Long-term value appears when the structure is right."
    },
    bullets: [
      {
        tr: "Venture builder mantığıyla çok sektörlü yapı tasarımı",
        en: "Multi-sector platform design with a venture-builder mindset"
      },
      {
        tr: "Türkiye ile GCC arasında pazar genişleme stratejileri",
        en: "Market expansion strategies between Turkiye and the GCC"
      },
      {
        tr: "Kurucu ve liderler için davranışsal karar çerçeveleri",
        en: "Behavioral decision frameworks for founders and leaders"
      }
    ]
  },
  {
    id: "expertise",
    slug: "expertise",
    orderIndex: 1,
    published: true,
    eyebrow: {
      tr: "Yetkinlik Alanları",
      en: "Core Domains"
    },
    title: {
      tr: "Yatırım hazırlığından liderlik zekasına kadar birbirini güçlendiren katmanlar.",
      en: "Interlocking layers from investment readiness to leadership intelligence."
    },
    body: {
      tr: "Her girişim aynı anda sermaye dili, operasyon tasarımı ve insan sistemi üzerinden okunur.",
      en: "Every venture is read simultaneously through capital language, operating design, and human systems."
    },
    bullets: [
      {
        tr: "Fractional real estate yatırım ağları",
        en: "Fractional real estate investor ecosystems"
      },
      {
        tr: "Diaspora platformları ve şehir bazlı ağlar",
        en: "Diaspora platforms and city-based networks"
      },
      {
        tr: "Koçluk ve dönüşüm programları",
        en: "Coaching and transformation programs"
      }
    ]
  },
  {
    id: "network",
    slug: "network",
    orderIndex: 2,
    published: true,
    eyebrow: {
      tr: "Coğrafi Derinlik",
      en: "Regional Reach"
    },
    title: {
      tr: "GCC, Türkiye ve daha geniş MENA hattında ilişki sermayesi kuran bir ağ tasarımı.",
      en: "A relationship architecture built across the GCC, Turkiye, and the broader MENA corridor."
    },
    body: {
      tr: "Doha, Dubai ve İstanbul arasında kurulan iş akışları; yatırımcı, yönetici ve topluluklar için güvenilir bir temas yüzeyi oluşturuyor.",
      en: "Workstreams built across Doha, Dubai, and Istanbul create a trusted touchpoint for investors, executives, and communities."
    },
    bullets: [
      {
        tr: "Qatar, UAE, KSA odaklı iş geliştirme",
        en: "Business development across Qatar, UAE, and KSA"
      },
      {
        tr: "Yatırımcı ve executive topluluk yönetimi",
        en: "Investor and executive community building"
      },
      {
        tr: "Kurumsal ortaklık ve referral mimarileri",
        en: "Corporate partnership and referral architectures"
      }
    ]
  }
];

export const defaultVentures: Venture[] = [
  {
    id: "qualtron-sinclair",
    slug: "qualtron-sinclair",
    orderIndex: 0,
    published: true,
    featured: true,
    name: "Qualtron Sinclair",
    category: {
      tr: "Asset-growth platform ve venture builder",
      en: "Asset-growth platform and venture builder"
    },
    summary: {
      tr: "Çok sektörlü varlık yönetimi, girişim inşası ve etik etki odaklı stratejik holding yapısı.",
      en: "A strategic holding structure for multi-sector assets, venture creation, and ethical long-horizon value."
    },
    description: {
      tr: "Yapı malzemeleri, tüketici ürünleri, AI, fintech ve danışmanlık gibi alanlarda yeni işlerin kurulması ve ölçeklenmesi için platform görevi görür.",
      en: "Acts as the platform for creating and scaling new businesses across construction materials, consumer products, AI, fintech, and strategic consulting."
    },
    url: "https://www.qualtronsinclair.com/",
    accent: "from-[#0f213f] via-[#17345d] to-[#174a46]",
    marketFocus: [
      {
        tr: "Varlık büyütme ve venture creation",
        en: "Asset growth and venture creation"
      },
      {
        tr: "Türkiye - GCC sermaye köprüleri",
        en: "Turkiye-GCC capital bridges"
      }
    ],
    metrics: [
      {
        label: { tr: "Kuruluş", en: "Founded" },
        value: "2024"
      }
    ]
  },
  {
    id: "corteqs",
    slug: "corteqs",
    orderIndex: 1,
    published: true,
    featured: true,
    name: "CorteQS Global",
    category: {
      tr: "Diaspora ağı ve şehir bazlı platform",
      en: "Diaspora network and city-based platform"
    },
    summary: {
      tr: "Diaspora topluluklarını güvenilir danışmanlar, işletmeler ve fırsatlarla buluşturan ölçeklenebilir bir ekosistem.",
      en: "A scalable ecosystem connecting diaspora communities with trusted advisors, businesses, and opportunities."
    },
    description: {
      tr: "İlk odak Türk diasporası olmak üzere, parçalı deneyimleri yapılandırılmış ağlara dönüştürmeyi hedefler.",
      en: "Starting with the Turkish diaspora, it transforms fragmented experiences into structured, opportunity-driven networks."
    },
    url: "https://corteqs.net/",
    accent: "from-[#102a52] via-[#0d4f6d] to-[#165c53]",
    marketFocus: [
      {
        tr: "Topluluk büyümesi",
        en: "Community growth"
      },
      {
        tr: "Danışman ve işletme eşleştirmesi",
        en: "Advisor and business matchmaking"
      }
    ],
    metrics: [
      {
        label: { tr: "Kuruluş", en: "Founded" },
        value: "2026"
      }
    ]
  },
  {
    id: "payal",
    slug: "payal",
    orderIndex: 2,
    published: true,
    featured: true,
    name: "PayAL",
    category: {
      tr: "Fractional real estate yatırım erişimi",
      en: "Fractional real estate investment access"
    },
    summary: {
      tr: "Global Türk yatırımcılarını Dubai, ABD ve KSA'daki fractional real estate fırsatlarına bağlayan concierge deneyim.",
      en: "A concierge experience connecting global Turkish investors to fractional real estate opportunities in Dubai, the US, and KSA."
    },
    description: {
      tr: "Yatırım içgörüsü, onboarding desteği ve ayrıcalıklı ortaklıklarla geleneksel platformların ötesine geçen bir ağ kurgular.",
      en: "Builds beyond the traditional platform by combining investment insight, onboarding support, and premium partner access."
    },
    url: "https://payaltr.com/",
    accent: "from-[#10213b] via-[#1d3e63] to-[#356f65]",
    marketFocus: [
      {
        tr: "Cross-border yatırım topluluğu",
        en: "Cross-border investor community"
      },
      {
        tr: "Referral ve trust layer",
        en: "Referral and trust layer"
      }
    ],
    metrics: [
      {
        label: { tr: "Kuruluş", en: "Founded" },
        value: "2025"
      }
    ]
  },
  {
    id: "hcd",
    slug: "hcd",
    orderIndex: 3,
    published: true,
    featured: false,
    name: "Human Consciousness Decoded",
    category: {
      tr: "Liderlik ve psycho-functional framework",
      en: "Leadership and psycho-functional framework"
    },
    summary: {
      tr: "Davranış, bilinç ve karar örüntülerini liderlik gelişimi için çeviren özgün bir düşünce yapısı.",
      en: "An original framework translating behavior, consciousness, and decision patterns into leadership development."
    },
    description: {
      tr: "Koçluk, eğitim ve dönüşüm programlarında kullanılan derin bir fikir altyapısı sunar.",
      en: "Provides the deep intellectual foundation used across coaching, education, and transformation programs."
    },
    url: "https://www.humanconsciousnessdecoded.com",
    accent: "from-[#132845] via-[#184061] to-[#1a5f53]",
    marketFocus: [
      {
        tr: "Executive ve board-level coaching",
        en: "Executive and board-level coaching"
      }
    ],
    metrics: [
      {
        label: { tr: "Yayın", en: "Publication" },
        value: "HCD"
      }
    ]
  }
];

export const defaultTimeline: TimelineEntry[] = [
  {
    id: "regional-director",
    orderIndex: 0,
    published: true,
    period: { tr: "2025 - Bugün", en: "2025 - Present" },
    title: { tr: "GCC Regional Director", en: "GCC Regional Director" },
    org: "Baltas International Group",
    body: {
      tr: "Qatar merkezli büyüme ortaklığı, danışmanlık, koçluk ve insan sistemleri dönüşümü.",
      en: "Growth partnership centered in Qatar spanning consulting, coaching, and human system transformation."
    }
  },
  {
    id: "qualtron-founder",
    orderIndex: 1,
    published: true,
    period: { tr: "2024 - Bugün", en: "2024 - Present" },
    title: { tr: "Founder", en: "Founder" },
    org: "Qualtron Sinclair",
    body: {
      tr: "Venture builder ve stratejik asset platformu olarak çok sektörlü yeni girişimlerin yapısını yönetiyor.",
      en: "Leads the structure of multi-sector ventures through a strategic asset platform and venture builder model."
    }
  },
  {
    id: "shaman",
    orderIndex: 2,
    published: true,
    period: { tr: "2001 - 2025", en: "2001 - 2025" },
    title: { tr: "Kurumsal Koç ve Growth Strategist", en: "Corporate Coach and Growth Strategist" },
    org: "Shaman Coaching & Strategic Advisory",
    body: {
      tr: "Kurucu liderler ve üst düzey yöneticilerle dönüşüm, hizalanma ve liderlik kalıbı çalışmaları yürüttü.",
      en: "Worked with founders and senior leaders on transformation, alignment, and leadership pattern intelligence."
    }
  },
  {
    id: "fga",
    orderIndex: 3,
    published: true,
    period: { tr: "1993 - 2002", en: "1993 - 2002" },
    title: { tr: "Managing Director", en: "Managing Director" },
    org: "FGA Imports",
    body: {
      tr: "Enerji, perakende, ithalat, üretim ve inşaat alanlarında faaliyet gösteren grup şirketlerinin yönetimini üstlendi.",
      en: "Led a group of companies operating across energy, retail, import, manufacturing, and construction."
    }
  }
];

export const defaultPublications: Publication[] = [
  {
    id: "hcd-book",
    slug: "human-consciousness-decoded",
    orderIndex: 0,
    published: true,
    title: {
      tr: "Human Consciousness Decoded",
      en: "Human Consciousness Decoded"
    },
    subtitle: {
      tr: "Liderlik ve bilinç üzerine kurucu düşünce çerçevesi",
      en: "The founding thought-framework on consciousness and leadership"
    },
    url: "https://www.humanconsciousnessdecoded.com",
    kind: {
      tr: "Yayın",
      en: "Publication"
    }
  }
];

export const defaultInsights: Insight[] = [
  {
    id: "insight-1",
    slug: "why-premium-networks-need-trust-architecture",
    orderIndex: 0,
    published: true,
    publishedAt: "2026-07-01",
    title: {
      tr: "Premium topluluklar neden güven mimarisi ister?",
      en: "Why premium communities need trust architecture"
    },
    excerpt: {
      tr: "Diaspora, yatırımcı ve danışman ağlarında kalıcı değer; içerik değil güven tasarımıyla oluşur.",
      en: "Lasting value in diaspora, investor, and advisor ecosystems comes from trust design, not content volume."
    },
    body: {
      tr: "Bugünün en güçlü topluluk platformları, insanları yalnızca aynı yerde toplamıyor; onları karar verebilecekleri, birbirini doğrulayabilecekleri ve ortak risk taşıyabilecekleri bir çerçeveye yerleştiriyor. Diaspora tabanlı ağlarda en kritik katman budur.\n\nCorteQS gibi yapılar için güven, yalnızca profil doğrulama değil; ilişki akışının, tavsiye kalitesinin ve beklenti yönetiminin görünür hale gelmesidir.",
      en: "The strongest platforms today do not merely gather people in the same place; they place them inside a frame where decisions, verification, and shared risk can happen. That is the critical layer for diaspora ecosystems.\n\nFor structures like CorteQS, trust is not profile verification alone. It is the visibility of relationship flow, referral quality, and expectation management."
    },
    tags: ["trust", "diaspora", "strategy"]
  },
  {
    id: "insight-2",
    slug: "venture-architecture-beyond-growth-hacking",
    orderIndex: 1,
    published: true,
    publishedAt: "2026-06-18",
    title: {
      tr: "Growth hacking'in ötesinde venture architecture",
      en: "Venture architecture beyond growth hacking"
    },
    excerpt: {
      tr: "Gerçek ölçeklenme; kanal optimizasyonundan önce yapının taşıyıcılığını sorgular.",
      en: "Real scale starts by questioning structural carrying capacity before channel optimization."
    },
    body: {
      tr: "Kurucuların sık düştüğü hata, büyüme çabasını operasyonel taktiklerle karıştırmaktır. Oysa venture architecture; karar hakları, sermaye uyumu, ekip ritmi ve kategori mesajı arasında bir uyum yaratır.\n\nBu nedenle strateji; sunum deck'i değil, davranış sistemi üretmelidir.",
      en: "A common founder mistake is confusing growth effort with operating tactics. Venture architecture instead aligns decision rights, capital logic, team rhythm, and category messaging.\n\nThat is why strategy should produce a behavior system, not just a presentation deck."
    },
    tags: ["venture", "leadership", "growth"]
  }
];

export const defaultMediaAssets: MediaAsset[] = [
  {
    id: "qualtron-logo",
    slug: "qualtron-logo",
    orderIndex: 0,
    published: true,
    title: {
      tr: "Qualtron Sinclair Web Sitesi",
      en: "Qualtron Sinclair Website"
    },
    url: "https://www.qualtronsinclair.com/",
    kind: "logo",
    alt: {
      tr: "Qualtron Sinclair bağlantısı",
      en: "Qualtron Sinclair link"
    }
  },
  {
    id: "linkedin",
    slug: "linkedin",
    orderIndex: 1,
    published: true,
    title: {
      tr: "LinkedIn Profili",
      en: "LinkedIn Profile"
    },
    url: "https://www.linkedin.com/in/burakakcakanat",
    kind: "document",
    alt: {
      tr: "Burak Akçakanat LinkedIn",
      en: "Burak Akçakanat LinkedIn"
    }
  }
];

export const defaultSiteSnapshot: SiteSnapshot = {
  settings: defaultSiteSettings,
  sections: defaultHomepageSections,
  ventures: defaultVentures,
  timeline: defaultTimeline,
  publications: defaultPublications,
  insights: defaultInsights,
  mediaAssets: defaultMediaAssets
};
