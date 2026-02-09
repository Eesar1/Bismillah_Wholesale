type MetaAttr = "name" | "property";

type MetaDefinition = {
  attr: MetaAttr;
  key: string;
};

type SeoPayload = {
  title: string;
  canonicalUrl: string;
  meta: Array<MetaDefinition & { content: string }>;
};

const SEO_METAS: MetaDefinition[] = [
  { attr: "name", key: "title" },
  { attr: "name", key: "description" },
  { attr: "name", key: "keywords" },
  { attr: "property", key: "og:type" },
  { attr: "property", key: "og:url" },
  { attr: "property", key: "og:title" },
  { attr: "property", key: "og:description" },
  { attr: "property", key: "og:image" },
  { attr: "property", key: "twitter:url" },
  { attr: "property", key: "twitter:title" },
  { attr: "property", key: "twitter:description" },
  { attr: "property", key: "twitter:image" },
];

type Snapshot = {
  title: string;
  canonicalUrl: string;
  meta: Record<string, string>;
};

let defaultSnapshot: Snapshot | null = null;

const getMetaSelector = (attr: MetaAttr, key: string) => `meta[${attr}="${key}"]`;

const getOrCreateMeta = (attr: MetaAttr, key: string) => {
  const selector = getMetaSelector(attr, key);
  let element = document.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }

  return element;
};

const getOrCreateCanonical = () => {
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  return canonical;
};

const ensureDefaultSnapshot = () => {
  if (defaultSnapshot) return;

  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const meta: Record<string, string> = {};

  for (const definition of SEO_METAS) {
    const selector = getMetaSelector(definition.attr, definition.key);
    const element = document.querySelector<HTMLMetaElement>(selector);
    meta[`${definition.attr}:${definition.key}`] = element?.content ?? "";
  }

  defaultSnapshot = {
    title: document.title,
    canonicalUrl: canonical?.href ?? "",
    meta,
  };
};

export const applySeo = ({ title, canonicalUrl, meta }: SeoPayload) => {
  ensureDefaultSnapshot();
  document.title = title;

  const canonical = getOrCreateCanonical();
  canonical.href = canonicalUrl;

  for (const entry of meta) {
    const element = getOrCreateMeta(entry.attr, entry.key);
    element.content = entry.content;
  }
};

export const restoreDefaultSeo = () => {
  if (!defaultSnapshot) return;

  document.title = defaultSnapshot.title;
  const canonical = getOrCreateCanonical();
  canonical.href = defaultSnapshot.canonicalUrl;

  for (const definition of SEO_METAS) {
    const element = getOrCreateMeta(definition.attr, definition.key);
    const snapshotKey = `${definition.attr}:${definition.key}`;
    element.content = defaultSnapshot.meta[snapshotKey] ?? "";
  }
};

export const upsertJsonLd = (id: string, value: unknown) => {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(value);
};

export const removeJsonLd = (id: string) => {
  document.getElementById(id)?.remove();
};
