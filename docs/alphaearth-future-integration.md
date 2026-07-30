# AlphaEarth and Earth Intelligence: Future Integration

## Position

AlphaEarth/Earth Engine is not an MVP dependency and must not be described as a source of live trail safety conditions.

## Reasonable future uses

With suitable imagery, permissions, ground truth, and geospatial expertise, Earth intelligence may help analyze:

- Long-term forest-cover or vegetation change
- Land clearing and quarry expansion
- River-course and watershed changes
- Development near trail corridors
- Broad environmental monitoring
- Conservation and historical-change dashboards

These are periodic analytical products, not immediate hiker-safety guarantees.

## What it cannot provide by itself

- Live mud depth or trail passability
- Current bridge damage
- A verified fallen tree or blocked gate
- Current river-crossing safety
- Rescue/emergency advice
- Precise rainfall at every trail segment
- Official closure status
- A substitute for a local guide, weather warning, or recent field report

Satellite revisit time, cloud cover, spatial resolution, model uncertainty, terrain shadows, and processing latency all limit operational use.

## Additional data required

- Authoritative trail geometries and trailhead coordinates
- Parish/land-management boundaries
- Historical and current weather/rainfall data
- River gauges where available
- Official warnings and closure feeds
- Moderated community reports
- Guide/admin verification records
- Labeled historical examples for any change-detection model
- Clear data freshness and confidence metadata

## Possible architecture

1. Keep public trail metadata in the CMS.
2. Store authoritative geometries in a reviewed geospatial service/private database.
3. Run scheduled Earth Engine analyses outside the static build.
4. Write only reviewed, non-sensitive summary indicators to a public API/cache.
5. Display observation date, source, method, confidence, and limitations.
6. Keep community/official reports as independent inputs.

The public site must degrade safely when Earth Engine data is unavailable.

## Cost and access

Cost depends on Earth Engine eligibility/licensing, compute/export volume, storage, refresh frequency, and engineering/monitoring needs. Before implementation:

- Confirm commercial/non-commercial terms.
- Estimate query/export/storage volume.
- Set budgets and quotas.
- Define who owns credentials, jobs, and incident response.
- Prototype on a small number of trails.

## Privacy and legal considerations

- Do not publish precise user/report locations without consent.
- Do not expose private-land access points or sensitive ecological locations without review.
- Respect imagery/data-provider licensing and attribution.
- Avoid claims of official, emergency, rescue, or government authority.
- Retain source dates and provenance.
- Obtain legal/privacy review before combining user reports with account/location history.

## Why community and weather data remain necessary

Earth observation describes physical change at a particular resolution and observation time. Hikers need near-term, ground-level facts: rainfall, river height, road access, closures, mud, fallen trees, bridge damage, and guide observations. A useful readiness system must combine transparent rules with recent weather, official notices, moderated community reports, and last-verified field data.

Any future score must include:

> This score is advisory and does not guarantee trail safety. Conditions may change rapidly.

