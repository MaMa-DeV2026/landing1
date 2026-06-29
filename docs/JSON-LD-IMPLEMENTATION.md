# JSON-LD Unified @graph Implementation

## Overview

Replaced the single `ProfessionalService` schema with a unified `@graph` structure containing **10 schema types** linked via `@id` cross-references. The `@graph` container allows multiple entities to coexist in one `<script>` block while maintaining relational integrity.

### Schemas Included

| # | Schema | @id | Graph Node |
|---|--------|-----|------------|
| 1 | **Person** | `#person` | mamad_dev identity, skills, languages, location, social profiles |
| 2 | **Organization** | `#organization` | Business entity, founder, contact point, logo |
| 3 | **WebSite** | `#website` | Site metadata, bilingual (`fa`/`en`), search action |
| 4 | **Service** | `#service` | Web design & development, worldwide area served |
| 5 | **CreativeWork** x4 | `#project-1..4` | Portfolio case studies with keywords, images, dates |
| 6 | **Review** x3 | `#review-1..3` | Client testimonials, 5-star ratings |
| 7 | **AggregateRating** | `#aggregate-rating` | 5.0 avg from 3 reviews |
| 8 | **FAQPage** | `#faq` | 4 Q&A pairs from the site FAQ section |
| 9 | **BlogPosting** x3 | `#blog-1..3` | Blog articles with dates and author refs |
| 10 | **BreadcrumbList** | `#breadcrumb` | 6-step site navigation path |

---

## 1. Placement Instructions

### Location

The JSON-LD block is placed in `index.html:21-246` — inside `<head>` between the favicon and Open Graph meta tags.

```html
<!-- Schema.org JSON-LD — Unified @graph -->
<script type="application/ld+json">
{ ... }
</script>
```

### Requirements

- Must be the **first** `<script type="application/ld+json">` on the page
- Must appear **above** any Open Graph or Twitter Card meta tags
- Must use `"@context": "https://schema.org"` (HTTPS)
- All `@id` values must be absolute URLs matching the site domain (`https://mamadweb.netlify.app/...`)

### Updating Content

When page content changes, update the corresponding graph node:

| Changed content | Update node(s) |
|----------------|----------------|
| New portfolio project | Add new `CreativeWork` node |
| New testimonial | Add new `Review` node; update `AggregateRating` counts |
| FAQ changes | Edit `FAQPage.mainEntity` array |
| New blog post | Add new `BlogPosting` node |
| Social links | Update `Person.sameAs` and `Organization.sameAs` |
| Contact info | Update `Person.email`, `Person.telephone`, `Organization.contactPoint` |

---

## 2. Validation Procedures

### Schema.org Validator (Recommended)

1. Go to [https://validator.schema.org/](https://validator.schema.org/)
2. Paste URL `https://mamadweb.netlify.app` (after deploy) or paste the raw JSON-LD markup
3. Verify **no errors** and **no warnings** are returned

### Google Rich Results Test

1. Go to [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results)
2. Enter the deployed URL
3. Check which rich result types are detected (FAQ, Breadcrumb, Review snippets, etc.)
4. Fix any "unable to detect" or "missing field" warnings

### Manual JSON Validation

```bash
# Validate syntax with Node.js
node -e "JSON.parse(require('fs').readFileSync('index.html','utf8').match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/)[1])" && echo "Valid JSON"
```

### Google Search Console

1. Navigate to **Search Console → URL Inspection**
2. Enter the homepage URL
3. Click **Test Live URL**
4. Scroll to **Structured Data** section and confirm all graph nodes are indexed

### Bing Webmaster Tools

1. Go to [https://www.bing.com/webmasters](https://www.bing.com/webmasters)
2. Use **URL Inspection** to verify structured data is parsed
3. Check **SEO → Structured Data** for error reports

---

## 3. Rich Result Expectations

### Confirmed Eligible (with exact markup provided)

| Rich Result Type | Schema Used | Eligibility | Expected in SERP |
|-----------------|-------------|-------------|------------------|
| **Logo** | `Organization.logo` | ✅ Exact | Brand logo next to search result |
| **Site Name** | `WebSite.name` | ✅ Exact | "mamad_dev — Professional Web Design" in breadcrumb |
| **FAQ Snippet** | `FAQPage` | ✅ Exact | Expandable Q&A dropdown in SERP |
| **Breadcrumb** | `BreadcrumbList` | ✅ Exact | Path: Home > About > Skills > Portfolio > Blog > Contact |
| **Review Snippet** | `Review` + `AggregateRating` | ✅ Exact | Star rating in SERP (if Google chooses) |
| **Search Box** | `WebSite.potentialAction` | ✅ Exact | Sitelinks search box in SERP (domain authority dependent) |

### Conditionally Eligible

| Rich Result Type | Schema Used | Eligibility | Requirement |
|-----------------|-------------|-------------|-------------|
| **Person Card** | `Person` | ⚠️ Requires Google Knowledge Graph inclusion | SameAs profiles must have sufficient authority |
| **Article** | `BlogPosting` | ⚠️ Requires dedicated article URLs | `url` fields point to blog pages that must exist |
| **Service** | `Service` | ⚠️ Google may show as local service | Requires Google Business Profile verification |
| **CreativeWork** | `CreativeWork` | ⚠️ Can appear in image/video carousels | Requires high-quality original images |

### Not Expected

| Rich Result Type | Reason |
|-----------------|--------|
| **Product Carousel** | No `Product` schema with offers |
| **Event** | No `Event` schema |
| **Recipe** | No `Recipe` schema |
| **Job Posting** | No `JobPosting` schema |
| **Course** | No `Course` schema |
| **Local Business** | Not using `LocalBusiness` — portfolio is online/remote |

### Monitoring

Check every 2-4 weeks:

1. **Google Search Console → Enhancements** — reports rich result status, errors, and warnings
2. **Google Search Console → Performance → Search appearance** — filter by "Rich results" to see click/impression data
3. **Bing Webmaster Tools → SEO → Structured Data** — similar reporting

---

## Graph Relationship Diagram

```
Person (#person)
├── founder ──────────► Organization (#organization)
├── author ───────────► CreativeWork (#project-*)
├── author ───────────► BlogPosting (#blog-*)
├── publisher ────────► Review (#review-*)
└── sameAs ───────────► External profiles

Organization (#organization)
├── founder ◄────────── Person (#person)
├── publisher ────────► WebSite (#website)
├── publisher ────────► BlogPosting (#blog-*)
├── provider ─────────► Service (#service)
├── itemReviewed ◄───── AggregateRating (#aggregate-rating)
└── sameAs ───────────► External profiles

WebSite (#website)
├── publisher ◄──────── Organization (#organization)
└── potentialAction ──► SearchAction

Service (#service)
├── provider ◄───────── Organization (#organization)
└── itemReviewed ◄───── Review (#review-*)
```
