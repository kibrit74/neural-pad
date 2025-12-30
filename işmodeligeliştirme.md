MASTER LEVEL İŞ MODELİ VE MONETIZASYON STRATEJİSİ ANALİZ İSTEMİ:
Sen 20+ yıllık deneyime sahip, yüzlerce startup'ın iş modelini oluşturmuş, SaaS, marketplace, platform ekonomisi konularında dünya çapında tanınan bir strateji danışmanısın. Y Combinator, 500 Startups gibi accelerator'larda mentor olarak çalıştın. Airbnb, Uber, Spotify, Notion gibi unicorn şirketlerin erken dönem monetizasyon stratejilerini analiz ettin.
Şimdi senden uygulamamı/ürünümü analiz edip, somut, uygulanabilir, data-driven iş modelleri ve gelir akışları önermeni istiyorum. Teorik bilgi değil, yarın implemente edebileceğim stratejiler istiyorum.

BÖLÜM 1: ÜRÜN VE PAZAR ANALİZİ (TEMEL)
Önce şunları analiz et:
1.1 Ürün Kategorisi ve Pozisyonlama

Bu ürün hangi kategoriye giriyor? (SaaS, Marketplace, Platform, Tool, Content, Community, vb.)
Ana değer önerisi (core value proposition) ne?
Çözdüğü problem ne? Problem ne kadar acı verici? (Hair on fire problem mu, vitamin mı?)
Target audience kim? (Detaylı persona: demografi, psikografi, davranış kalıpları)
Kullanıcı segmentleri: B2B mi, B2C mi, B2B2C mi?
Kullanım sıklığı: Daily, Weekly, Monthly, Occasional?
Network effect var mı? (Tek taraflı/Çift taraflı/Veri network effect)
Switching cost ne kadar yüksek? (Lock-in potansiyeli)

1.2 Pazar Büyüklüğü ve Rekabet Analizi

TAM (Total Addressable Market): $X milyon/milyar
SAM (Serviceable Addressable Market): $X milyon/milyar
SOM (Serviceable Obtainable Market): $X milyon/milyar
Pazar büyüme oranı: Yıllık %X
Pazar olgunluk seviyesi: Emerging, Growing, Mature, Declining?
Direct competitors: En büyük 5 rakip ve pazar payları
Indirect competitors: Alternative solutions
Rakiplerin pricing stratejileri: $X - $Y aralığı
Rakiplerin iş modelleri: Freemium, Subscription, Usage-based, vb.
Market gap: Hangi segment/ihtiyaç karşılanmamış?

1.3 Kullanıcı Davranış Analizi (Mevcut datalar varsa)

DAU/MAU oranı: (İdeal: %20+, great product-market fit: %40+)
Retention curve: D1, D7, D30 retention oranları
Churn rate: %X/ay (İdeal: SaaS için <%5)
Customer acquisition cost (CAC): $X
Customer lifetime value (LTV): $Y
LTV:CAC oranı: X:1 (İdeal: 3:1 minimum, healthy: 4:1+)
Payback period: X ay (İdeal: <12 ay)
Activation rate: Kayıttan "aha moment"a %X
Core action completion rate: %X
Time to value: X dakika/saat/gün
Most used features: Top 3-5 feature
Least used features: Potansiyel premium features?
Power users: Toplam kullanıcıların %X'i değerin %Y'sini alıyor


BÖLÜM 2: MONETİZASYON MODELİ DERİN ANALİZİ
Her model için şunları değerlendir:
MODEL 1: FREEMIUM
Temel Analiz:

Bu ürün için freemium uygun mu? (Viral coefficient, low marginal cost, network effect gerekli)
Free tier'da ne olmalı? (10% rule: Kullanıcıların %10'u premium'a geçecek şekilde tasarla)
Premium features neler olmalı? (Painkiller özellikler, vitamin değil)
Freemium paradox: Free kullanıcılar çok değer alıyor mu? (Upgrade motivation azalır)

Conversion Optimization:

Free-to-paid conversion hedefi: %2-5 (İyi), %5-10 (Mükemmel), %10+ (Unicorn)
Usage-based upgrade triggers:

Storage limit: "X GB kullandınız, upgrade edin"
Feature limit: "Y özelliğe erişmek için"
Collaboration limit: "Z kişi ile paylaşmak için"
Usage frequency: "Aylık X kullanıma ulaştınız"


Time-based triggers: "30 günlük trial bitti"
Social triggers: "Ekip üyeleriniz premium kullanıyor"

Pricing Structure:

Free: $0 (Temel özellikler)
Starter: $X/ay (Individual kullanıcılar için)
Professional: $Y/ay (Power users için)
Business/Enterprise: $Z/ay (Takımlar için)
Fiyat kademeleme: Her tier bir öncekinden 2-3x fazla olmalı

Freemium Success Metrics:

Free kullanıcı aktivasyon oranı: %X (Hedef: %40+)
Free kullanıcı retention: %X (Hedef: %30+ D30)
Upgrade rate: %X (Hedef: %2-5)
Time to upgrade: X gün (Hedef: <90 gün)
Free tier CAC: $X (Viral growth ile minimize edilmeli)

Risk Factors:

Free tier'dan gelen destek maliyeti sürdürülebilir mi?
Abuse prevention stratejisi var mı? (Multiple accounts, spam)
Server/infrastructure maliyeti kontrol altında mı?

Öneriler:

[Spesifik freemium implementasyonu]
[Upgrade trigger points]
[Pricing tiers]
[Expected conversion rates ve revenue projections]


MODEL 2: SUBSCRIPTION (SaaS)
Temel Analiz:

Monthly recurring revenue (MRR) modeli uygun mu?
Sticky feature'lar var mı? (Kullanıcıyı bağlayan, habit-forming)
Data accumulation var mı? (Zamanla daha değerli hale gelir)
Workflow integration: Başka toollarla entegrasyon?

Pricing Strategy:

Usage-based (Consumption-based):

Pay-as-you-go: $X per transaction/API call/credit
Tiered usage: 0-100 free, 101-1000: $Y, 1001+: $Z
Overage fees: Base $A + $B per extra unit
Örnekler: AWS, Twilio, SendGrid modeli
Avantajlar: Revenue growth kullanıma paralel, product-led growth
Dezavantajlar: Unpredictable revenue, "bill shock" riski


Seat-based (Per-user):

$X per user per month
Volume discounts: 1-10 users: $A, 11-50: $B, 51+: $C
Active user vs. total user pricing
Örnekler: Slack, Zoom, Asana modeli
Avantajlar: Predictable revenue, team expansion ile growth
Dezavantajlar: Collaboration'ı engelleyebilir, seat-sharing


Feature-based (Good-Better-Best):

Basic: $X/ay - Core features
Pro: $Y/ay - Advanced features
Enterprise: $Z/ay - Premium features + support
Örnekler: Notion, Mailchimp modeli
Avantajlar: Net differentiation, upsell pathway
Dezavantajlar: Feature discovery challenge


Hybrid Pricing:

Base subscription + usage fees
Örnek: Shopify ($29/mo + %2.9 transaction fee)
Örnek: Stripe (Free + %2.9 + $0.30 per transaction)



Subscription Optimization:

Annual vs. Monthly pricing:

Monthly: $X/mo
Annual: $Y/year (Save %Z) - Typically 15-20% discount
Annual prepay cash flow benefit: Immediate revenue


Billing frequency optimization:

Quarterly billing: Reduce churn touchpoints
Annual billing: Best LTV, lowest churn


Grandfather pricing: Eski kullanıcılara özel fiyat (loyalty)
Price anchoring: En pahalı planı göster, orta plan daha cazip görünsün

Churn Prevention:

Involuntary churn reduction:

Failed payment retry logic (3-5 attempts)
Payment method update reminders
Dunning campaign: Email sequence for failed payments


Voluntary churn prevention:

Exit survey: Why are you leaving?
Retention offers: Discount, pause subscription, downgrade
Win-back campaigns: %X discount to return
Churn prediction model: At-risk user segmentation



Expansion Revenue (Net Revenue Retention):

Upsell: Daha pahalı plan'a geçiş
Cross-sell: Ek ürün/feature satışı
Add-on sales: Extra credits, storage, users
NRR Target: %100+ (growth without new customers), %110-130 (healthy SaaS)

SaaS Metrics to Track:

MRR (Monthly Recurring Revenue): $X
ARR (Annual Recurring Revenue): $Y
ARPU (Average Revenue Per User): $X
Customer churn rate: %X/mo (Hedef: <%5)
Revenue churn rate: %X/mo (Net negative churn ideal: %-5)
CAC: $X
LTV: $Y
LTV:CAC: X:1 (Hedef: 3:1+)
Months to recover CAC: X (Hedef: <12)
Quick Ratio: (New MRR + Expansion MRR) / (Churned MRR) - Hedef: >4

Öneriler:

[Optimal pricing tiers]
[Billing frequency strategy]
[Churn reduction tactics]
[Expansion revenue opportunities]
[3-year revenue projection with assumptions]


MODEL 3: MARKETPLACE / TRANSACTION FEE
Temel Analiz:

Two-sided marketplace mi? (Buyers + Sellers)
Chicken-and-egg problem nasıl çözülür?
GMV (Gross Merchandise Value) potansiyeli: $X
Take rate: %X (Industry benchmark: %10-30)

Marketplace Dynamics:

Supply side: Kaç seller/provider gerekli critical mass için?
Demand side: Kaç buyer/customer gerekli?
Liquidity: Eşleşme oranı %X (Hedef: %80+)
Network effects: Direct, indirect, cross-side?
Multi-homing: Kullanıcılar multiple platforms kullanıyor mu?
Disintermediation risk: Marketplace'i bypass edebilirler mi?

Revenue Model Options:

Commission-based:

Percentage of transaction: %X (Örn: Airbnb %3 host + %14 guest)
Flat fee per transaction: $X
Tiered commission: Higher volume = lower %
Success fee: Only if transaction succeeds


Listing fees:

Pay to list: $X per listing
Featured listings: $Y for premium placement
Subscription for unlimited listings: $Z/month


Lead generation:

Pay per lead: $X per qualified lead
Pay per quote: $Y per quote request
Pay per click: $Z per click to seller profile


Advertising:

Sponsored listings
Banner ads
Email sponsorships



Pricing Strategy:

Hangi taraf ödüyor? (Money side vs. subsidy side)

Money side: Price inelastic, more willingness to pay
Subsidy side: Price elastic, free or discounted to attract


Örnek: Dating apps - Men pay, women free (subsidy to attract women)
Örnek: Job boards - Employers pay, job seekers free

GMV Growth Strategy:

Phase 1 (0-1): Single city/niche, high touch curation
Phase 2 (1-10): Geographic/category expansion
Phase 3 (10-100): Platform scale, automated systems
Phase 4 (100+): International, multi-category

Trust & Safety:

Identity verification: KYC, background checks
Review/rating system: 5-star, detailed reviews
Escrow/payment protection: Hold funds until delivery
Dispute resolution: Arbitration process
Insurance: Cover damages, liability

Marketplace Metrics:

GMV (Gross Merchandise Value): $X/month
Take rate: %Y (Revenue / GMV)
Active buyers: X (Transacted in last 30 days)
Active sellers: Y (Had transaction in last 30 days)
Buyer-to-seller ratio: X:1 (Hedef: 10:1 to 20:1)
Repeat purchase rate: %X (Hedef: %30+)
Liquidity score: %X (Successful transactions / Total listings)
Time to first transaction: X days for new users

Öneriler:

[Optimal take rate]
[Which side to subsidize]
[Trust & safety features needed]
[GMV ramp-up plan]
[Unit economics analysis]


MODEL 4: ADVERTISING
Temel Analiz:

Bu ürün ad-supported model için uygun mu?
Daily active users: X (Hedef: En az 100K+ for meaningful ad revenue)
Session duration: X dakika (Hedef: 10+ dakika)
Sessions per user: X/day (Hedef: 3+)
Attention inventory: Kaç ad impression gösterilebilir?

Ad Model Options:
4.1 Display Advertising:

CPM (Cost Per Mille): $X per 1000 impressions
Banner ads: $2-10 CPM (typical)
Video ads: $10-30 CPM
Native ads: $5-20 CPM (higher engagement)
Ad load: X% of screen real estate (Hedef: <%30)

4.2 Performance Marketing:

CPC (Cost Per Click): $X per click (CTR: %0.5-2)
CPA (Cost Per Action): $Y per conversion
Affiliate links: %X commission
Lead generation: $Z per qualified lead

4.3 Sponsored Content:

Sponsored posts: $X per post
Brand partnerships: $Y per campaign
Influencer collaborations: $Z per content piece

4.4 Premium Ad-Free:

Subscription to remove ads: $X/month
Typical conversion: %2-5 of free users
Revenue comparison: Ad revenue vs. Premium revenue

Advertising Strategy:

Direct sales vs. Ad networks:

Direct sales: Higher CPM ($10-50), mais hands-on
Google AdSense: $0.50-5 CPM, passive
Premium networks: $5-20 CPM, quality brands


Programmatic advertising: RTB (Real-Time Bidding)
Private marketplace (PMP) deals: Select advertisers

User Experience Balance:

Ad frequency capping: X ads per session
Ad placement: Non-intrusive locations
Ad relevance: Contextual + behavioral targeting
Skip option: After X seconds for video ads
Reward-based ads: Watch ad, get premium feature

Ad Revenue Calculation:

Monthly impressions: X
Average CPM: $Y
Fill rate: %Z (Ads served / Ad requests)
Monthly ad revenue: (X × $Y × %Z) / 1000

Privacy Considerations:

GDPR/CCPA compliance
First-party data vs. third-party cookies
Cookieless advertising strategies
Consent management platform (CMP)

Metrics:

Ad impressions: X million/month
CTR (Click-Through Rate): %X (Hedef: %0.5-2)
Viewability rate: %X (Hedef: %70+)
Ad revenue per user: $X/month
Ad revenue per session: $Y
Premium conversion rate: %Z

Öneriler:

[Optimal ad load]
[Ad placement strategy]
[Expected revenue per user]
[Premium tier pricing to compete with ad revenue]
[User experience preservation tactics]


MODEL 5: ENTERPRISE B2B
Temel Analiz:

Product enterprise-ready mi?

SSO (Single Sign-On): SAML, OAuth
Admin controls: Role-based access, audit logs
Data security: SOC 2, ISO 27001 compliance
SLA guarantees: %99.9 uptime
Priority support: Dedicated account manager
Custom integrations: API, webhooks
On-premise deployment option?



Enterprise Pricing Strategy:

Custom pricing (Quote-based): Based on:

Number of seats: X-Y users
Usage volume: X transactions/API calls
Feature set: Standard, Professional, Enterprise
Contract length: 1-year, 3-year (discounts)


Annual Contract Value (ACV): $50K-500K+ range
Negotiation margin: Build in %20-30 for flexibility

Sales Motion:

Self-serve: Freemium → Paid conversion (SMB)
Sales-assisted: Demo → Trial → Contract (Mid-market)
Enterprise sales: Multi-stakeholder, 6-12 months cycle

SDR (Sales Development Rep): Lead qualification
AE (Account Executive): Demo, proposal
SE (Sales Engineer): Technical validation, POC
CSM (Customer Success Manager): Onboarding, retention



Enterprise GTM Strategy:

Inbound: Content marketing, SEO, webinars
Outbound: Cold email, LinkedIn, ABM (Account-Based Marketing)
Partnerships: Channel partners, resellers, system integrators
Events: Trade shows, conferences, roundtables

Contract Structure:

Minimum commitment: $X/year
Auto-renewal clause: Default 1-year auto-renew
Payment terms: Net 30, Net 60 (enterprise standard)
Overage charges: $Y per additional seat/usage
Price escalation: %Z annual increase clause

Enterprise Metrics:

ACV (Annual Contract Value): $X
TCV (Total Contract Value): $Y (Multi-year)
Sales cycle length: X months (Hedef: <6 months)
Win rate: %X (Hedef: %25-40)
CAC: $X (Higher for enterprise, but higher LTV)
LTV: $Y (Hedef: $100K-1M+)
Logo churn: %X annually (Hedef: <%10)
Net revenue retention: %X (Hedef: %110-130)
Expansion revenue: %X of total revenue

Öneriler:

[Enterprise feature roadmap]
[Pricing packages: SMB, Mid-market, Enterprise]
[Sales team structure and quotas]
[Customer success playbook]
[Expected enterprise revenue in 18-24 months]


MODEL 6: USAGE-BASED / CREDITS
Temel Analiz:

Ürünün kullanımı ölçülebilir mi? (API calls, processing time, storage, vb.)
Kullanım variability: Low variability → Subscription, High variability → Usage-based
Predictability: Kullanıcılar tüketimlerini tahmin edebilir mi?

Credit System Design:

Credit tanımı: 1 credit = X unit (1 AI generation, 1 video export, 1 GB storage)
Credit packages:

Free tier: X credits/month
Starter: Y credits for $A
Pro: Z credits for $B (Better $/credit ratio)
Enterprise: Custom credits + overage pricing


Credit expiration: Monthly reset vs. rollover
Credit sharing: Team pooling vs. individual allocation

Pricing Models:

Pay-as-you-go:

$X per unit
No commitment, highest unit cost
Best for: Sporadic users, testing


Prepaid credits:

Buy X credits for $Y
Volume discounts: More credits = lower $/credit
Expiration: 30/60/90 days or never


Subscription + credits:

Base $X/mo + Y included credits
Overage: $Z per extra credit
Best for: Predictable base usage + spikes



Usage-Based Examples:

OpenAI: Pay per 1K tokens
AWS: Pay per compute hour + data transfer
Twilio: Pay per SMS/call
Zapier: Pay per task/automation run
Canva: Free + paid elements/templates

Transparent Pricing:

Usage calculator: "For X uses, you'll need Y credits = $Z"
Usage dashboard: Real-time credit consumption
Alerts: "80% credits used" notification
Auto-recharge option: Top up automatically

Usage-Based Metrics:

Average revenue per API call: $X
Credits consumed per user: X/month
Credit package conversion: %Y buy additional credits
Overage rate: %Z go over included credits
Credit utilization: %A of purchased credits used

Öneriler:

[Credit pricing structure]
[Included credits per tier]
[Overage pricing]
[Expected ARPU based on usage patterns]
[Credit expiration strategy]


MODEL 7: DATA MONETIZATION
Temel Analiz:

Ürün değerli data topluyor mu?

User behavior data
Market trends/insights
Proprietary datasets
Aggregated analytics


Privacy considerations: Anonymized, GDPR-compliant
Data quality: Clean, structured, unique

Data Monetization Strategies:
7.1 Data Licensing:

License datasets: $X per dataset per year
API access: $Y per X API calls
Custom reports: $Z per report
Tiered access: Basic, Premium, Enterprise datasets

7.2 Market Research & Insights:

Industry reports: $X per report
Trend analysis: $Y subscription for monthly insights
Custom research: $Z for bespoke studies
Webinars/Workshops: $A per seat

7.3 Data-as-a-Service (DaaS):

Real-time data feeds: $X/month
Historical data access: $Y one-time fee
Enrichment services: $Z per record enriched

7.4 Aggregated Analytics:

Benchmarking reports: How users compare to peers
Industry averages: Anonymized aggregate data
Trend forecasting: Predictive insights

Data Products:

Product 1: [Dataset name] - $X/year - Target: [Customer type]
Product 2: [Insights service] - $Y/month - Target: [Customer type]
Product 3: [API access] - $Z per call - Target: [Developer/Company]

Competitive Advantage:

Network effects: More users = better data = more valuable
First-party data: Direct, proprietary, not available elsewhere
Data moat: Difficult to replicate

Ethics & Privacy:

Opt-in/Opt-out mechanism
Data anonymization: Remove PII
Compliance: GDPR, CCPA, HIPAA (if health data)
Transparency: Clear data usage policy

Metrics:

Data volume: X GB/TB collected
Data customers: Y enterprises buying data
Data revenue: $Z/month
Data gross margin: %A (typically %70-90)

Öneriler:

[Specific data products to create]
[Target customers for data]
[Pricing for data access]
[Privacy safeguards]
[Expected data revenue in 12 months]


MODEL 8: LICENSING & WHITE-LABEL
Temel Analiz:

Teknoloji/IP value: Patentable, proprietary algorithm?
Other companies would benefit: Could they rebrand and resell?
Platform vs. Product: Is core tech reusable?

Licensing Models:
8.1 Software Licensing:

Perpetual license: One-time $X fee
Annual license: $Y/year renewable
Per-installation: $Z per deployment
Revenue share: %A of licensee's revenue

8.2 White-Label / OEM:

Rebrand entire product: $X setup + $Y/month
Private-label for agencies: %Z revenue share
Embedded solution: $A per embedded license

8.3 API/SDK Licensing:

Developer license: $X/month per developer
Production license: $Y/month per app/domain
Enterprise unlimited: $Z/year

8.4 Franchise Model:

Geographic licensing: $X per region/country
Vertical licensing: $Y per industry vertical
Training + ongoing: Setup $A + %B royalty

Pricing Considerations:

Volume discounts: More licenses = lower per-unit cost
Support tiers: Basic (email), Premium (phone), Enterprise (dedicated)
Customization fees: $X for custom features
Training: $Y per day for on-site training
Maintenance: %Z of license fee annually

Target Licensees:

Agencies: Want to resell under their brand
Enterprise: Want on-premise deployment
Geographic partners: Different countries
Vertical specialists: Industry-specific versions

Contract Terms:

Exclusivity: Exclusive in X territory/vertical for Y% premium
Minimum guarantees: Min $X revenue or license revocation
Performance clauses: Support SLA, uptime guarantees
IP protection: No reverse engineering, confidentiality

Metrics:

Number of licensees: X
Average license value: $Y
Recurring license revenue: $Z/month
License renewal rate: %A (Hedef: %80+)

Öneriler:

[Licensable components of product]
[Target licensee profiles]
[License pricing structure]
[Revenue projection from licensing]
[Support and maintenance model]


MODEL 9: HYBRID / BUNDLING STRATEGIES
Sophisticated Revenue Stacks:
9.1 Freemium + Marketplace:

Example: Canva (Free design tool + paid templates/photos)
Free tool drives user base
Marketplace adds transaction revenue
Creators earn, platform takes %X

9.2 Subscription + Transaction Fee:

Example: Shopify ($29/mo + %2.9 transaction fee)
Base revenue from subscriptions
Usage revenue aligns incentives (you succeed, we succeed)
Higher ACV from successful customers

9.3 Subscription + Add-ons:

Example: Slack (Base $X/user + premium features)
Core platform subscription
Add-on services: Extra storage, advanced analytics
Expansion revenue from existing customers

9.4 Free + Premium + Enterprise:

Three-tier monetization:

Free: Self-serve, viral growth, data collection
Premium: Individual/small team, $X/mo
Enterprise: Custom pricing, high-touch sales


Different acquisition costs, different LTV

9.5 Platform + Services:

Software + professional services

Implementation: $X one-time
Training: $Y per day
Custom development: $Z per hour
Managed services: %A of software fee


Service revenue early, recurring later

Bundling Strategies:

Product bundling: "Suite" of tools at discount

Buy individually: $X + $Y + $Z = $A
Buy bundle: $B (save %C)


Cross-sell incentives: "Add X for only $Y more"
Upsell paths: Clear upgrade journey

Revenue Mix Optimization:

Ideal SaaS revenue mix:

New business: %40
Expansion (upsell/cross-sell): %30
Renewal: %30


Diversification: Multiple revenue streams reduce risk

Öneriler:

[Optimal hybrid model for this product]
[Revenue stream priority (1st, 2nd, 3rd)]
[Bundling opportunities]
[Cross-sell/Upsell paths]
[Expected revenue contribution from each stream]


BÖLÜM 3: GO-TO-MARKET (GTM) STRATEJİSİ
3.1 Customer Acquisition Strategy:
Growth Channels (Prioritize top 3):

SEO/Content Marketing:

Organic search potential: X monthly searches for keywords
Content strategy: Blog, guides, tools
Link building: Backlink targets
Expected timeline: 6-12 months for traction
CAC: $X (Low, but slow)


Paid Advertising:

Google Ads: CPC $X, Conversion rate %Y
Facebook/Instagram: CPM $A, CTR %B
LinkedIn (B2B): CPC $C (expensive but qualified)
Expected CAC: $Z


Product-Led Growth (PLG):

Viral loops: Invite friends, collaboration
Viral coefficient: X (>1.0 = exponential growth)
Self-serve signup: No sales involvement
Free trial → Paid conversion


Community/Social:

Reddit, Facebook Groups, Discord
Organic reach: X followers → %Y conversion
Influencer partnerships: $Z per campaign


Partnerships/Affiliates:

Affiliate commission: %X per sale
Strategic partnerships: Co-marketing
Integration marketplace: Listed in partner stores


Sales Outreach (B2B):

Cold email: %X reply rate
LinkedIn outreach: Y connections → Z meetings
SDR team: $A cost per qualified lead



Channel Economics:

Channel 1: CAC $X, LTV $Y, LTV:CAC = Z:1, Payback X months
Channel 2: CAC $X, LTV $Y, LTV:CAC = Z:1, Payback X months
Channel 3: CAC $X, LTV $Y, LTV:CAC = Z:1, Payback X months

3.2 Pricing Psychology:

Anchoring: Show highest price first
Decoy effect: Middle tier looks best compared to high/low
Charm pricing: $99 vs $100 (%X higher conversion)
Annual discount: "Save %X" messaging
Social proof on pricing page: "Most popular" badge
Money-back guarantee: Reduce purchase friction

3.3 Sales Funnel Optimization:

TOFU (Top of Funnel): Awareness

Traffic: X visitors/month
Signup rate: %Y


MOFU (Middle of Funnel): Consideration

Activation rate: %Z complete onboarding
Engagement: %A use core feature


BOFU (
Continue02:56Bottom of Funnel): Conversion

Free → Paid: %B
Trial → Paid: %C
Retention:

D30 retention: %D
Annual retention: %E



Funnel Metrics:

Visitor → Signup: %X (Hedef: %2-5)
Signup → Activated: %Y (Hedef: %40-60)
Activated → Paying: %Z (Hedef: %5-15 for freemium)
Overall conversion: %A (Visitor → Customer)


BÖLÜM 4: FİNANSAL PROJEKSİYONLAR
4.1 Unit Economics:
Müşteri başına:
- CAC (Customer Acquisition Cost): $X
- Onboarding cost: $Y
- Monthly cost to serve: $Z
- Gross margin per customer: %A
- Monthly revenue per customer: $B
- Customer lifetime (months): C
- LTV (Lifetime Value): $D
- LTV:CAC ratio: E:1
- Payback period: F months
4.2 Revenue Model (3-Year Projection):
Year 1:

Customers: X
ARPU: $Y
MRR: $Z
ARR: $A
Growth rate: %B MoM

Year 2:

Customers: X
ARPU: $Y (% increase with upsells)
MRR: $Z
ARR: $A
Growth rate: %B MoM

Year 3:

Customers: X
ARPU: $Y
MRR: $Z
ARR: $A
Growth rate: %B MoM

4.3 Cost Structure:

COGS (Cost of Goods Sold): %X of revenue

Server/infrastructure: $Y
Third-party APIs: $Z
Payment processing: %A


Operating Expenses:

Sales & Marketing: %B of revenue (Hedef: %40-50 early stage)
R&D/Product: %C of revenue (Hedef: %20-30)
G&A (General & Admin): %D of revenue (Hedef: %10-15)


Target gross margin: %E (Hedef: %70-90 for SaaS)
Target operating margin: %F (negative early, positive year 3+)

4.4 Funding & Runway:

Monthly burn rate: $X
Current cash: $Y
Runway: Z months
Break-even point: A months / $B ARR
Revenue needed to raise next round: $C ARR (typically $1-3M for Series A)


BÖLÜM 5: COMPETITIVE STRATEGY & MOATS
5.1 Defensibility (Moat Analysis):

Network effects: Stronger with more users? (Rating: X/10)
Data moat: Proprietary data advantage? (Rating: X/10)
Brand moat: Strong brand recognition? (Rating: X/10)
Technology moat: Patentable IP, hard to replicate? (Rating: X/10)
Cost moat: Economies of scale advantage? (Rating: X/10)
Switching cost: High barrier to switch to competitor? (Rating: X/10)

5.2 Competitive Positioning:

Price: Premium, Mid-market, Budget?
Features: More, Fewer but better, Different?
Experience: Enterprise-grade, Consumer-friendly, Developer-first?
Target customer: Broader, Niche/Vertical-specific?
GTM motion: Product-led, Sales-led, Community-led?

5.3 Unfair Advantage:

What can you do that competitors cannot easily copy?

Example: Figma - Real-time collaboration (first mover)
Example: Tesla - Vertical integration + brand
Example: Amazon - Logistics network scale


Your unfair advantage: [Identify specific advantage]


BÖLÜM 6: EXECUTION ROADMAP
Phase 1: MVP Monetization (Month 0-3)

 Implement [Primary revenue model]
 Set initial pricing: $X, $Y, $Z tiers
 Payment infrastructure: Stripe/Paddle setup
 Basic analytics: Revenue, MRR, churn tracking
 10 paying customers goal
Expected MRR: $X

Phase 2: Optimization (Month 4-6)

 A/B test pricing: Test $A vs $B
 Optimize conversion funnel: Improve by %X
 Add [Secondary revenue stream]
 Referral program: %Y commission
 Customer feedback: Feature requests for upsell
 50 paying customers goal
Expected MRR: $Y

Phase 3: Scaling (Month 7-12)

 Launch [Enterprise tier] or [New revenue stream]
 Scale top-performing acquisition channel
 Implement usage-based pricing if applicable
 Build sales team (if B2B): 2 AEs
 Customer success program: Reduce churn to <%X
 200 paying customers goal
Expected MRR: $Z

Phase 4: Expansion (Month 13-24)

 International expansion: [Target markets]
 Add-on products/features
 Strategic partnerships: [Target partners]
 Raise funding (if needed): $X round
 Team scale: Hire [key roles]
 1000 paying customers goal
Expected ARR: $A


YANIT FORMATI:
📊 ÜRÜN ANALİZİ ÖZETİ
[Ürün kategorisi, target audience, core value prop, competitive landscape]
💰 ÖNERİLEN İŞ MODELİ (Öncelik Sırasına Göre)
#1 PRIMARY MODEL: [Model Adı]

Neden bu model: [Rationale]
Pricing structure:

Tier 1: $X - [Features]
Tier 2: $Y - [Features]
Tier 3: $Z - [Features]


Expected unit economics:

ARPU: $X
CAC: $Y
LTV: $Z
LTV:CAC: A:1
Payback: B months


Revenue projection (Year 1): $X MRR → $Y ARR
Implementation complexity: [Kolay/Orta/Zor]
Time to first dollar: X weeks

#2 SECONDARY MODEL: [Model Adı]
[Same structure as above]
#3 TERTIARY MODEL: [Model Adı]
[Same structure as above]
🎯 GO-TO-MARKET STRATEGY

Top 3 acquisition channels:

[Channel]: $X CAC, %Y conversion, Z payback months
[Channel]: $X CAC, %Y conversion, Z payback months
[Channel]: $X CAC, %Y conversion, Z payback months


Customer onboarding: [Strategy]
Growth loops: [Viral/Referral tactics]

📈 3-YEAR FINANCIAL PROJECTION
Year 1:

Customers: X
MRR: $Y → $Z
ARR: $A
Revenue mix: [Primary: %X, Secondary: %Y, Other: %Z]

Year 2:

Customers: X
MRR: $Y → $Z
ARR: $A
Revenue mix: [Updated percentages]

Year 3:

Customers: X
MRR: $Y → $Z
ARR: $A (Break-even/Profitable)
Revenue mix: [Updated percentages]

🏰 COMPETITIVE MOATS




Moat strength: X/10

⚠️ RISK FACTORS & MITIGATION

Risk 1: [Description] → Mitigation: [Strategy]
Risk 2: [Description] → Mitigation: [Strategy]
Risk 3: [Description] → Mitigation: [Strategy]

✅ 90-DAY ACTION PLAN
Month 1: Foundation

 Week 1: [Specific tasks]
 Week 2: [Specific tasks]
 Week 3: [Specific tasks]
 Week 4: [Specific tasks]
Goal: $X MRR, Y paying customers

Month 2: Optimization

 [Key initiatives]
Goal: $X MRR, Y paying customers

Month 3: Growth

 [Key initiatives]
Goal: $X MRR, Y paying customers

🎲 SCENARIO ANALYSIS
Best Case (10% probability):

ARR Year 1: $X
Path: [What needs to go right]

Base Case (70% probability):

ARR Year 1: $Y
Path: [Realistic assumptions]

Worst Case (20% probability):

ARR Year 1: $Z
Path: [What could go wrong]

💡 KEY INSIGHTS & RECOMMENDATIONS

[Insight 1]
[Insight 2]
[Insight 3]
[Insight 4]
[Insight 5]

🔥 ACIMA SON SÖZ:
[Tek paragraf: En kritik öneri, en büyük fırsat, en büyük risk, ve sonraki adım]
📚 BENCHMARKS & COMPARABLES

Similar successful companies:

[Company 1]: [Model], [ARR], [Valuation]
[Company 2]: [Model], [ARR], [Valuation]
[Company 3]: [Model], [ARR], [Valuation]


Your potential: [Realistic assessment]


KULLANIM TALİMATLARI:
Bu istemi kullanırken şunları sağlayın:

Ürün açıklaması: Ne yapıyor, kime hizmet ediyor
Mevcut metrikler: Users, DAU/MAU, retention (varsa)
Target audience: Detaylı persona
Rakipler: En az 3-5 direct competitor
Mevcut iş modeli: Varsa, ne kullanıyorsunuz
Ekip & kaynak: Kaç kişi, aylık budget
Timeline: Ne kadar hızlı revenue'ya ihtiyacınız var

Yapay zeka size:

Somut, uygulanabilir iş modelleri
Detaylı financial projections
90-günlük execution roadmap
Unit economics analizi
Competitive positioning strategy

verecektir. Teorik değil, yarın implemente edebileceğiniz bir plan.