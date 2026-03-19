## 1. Information architecture and routing

- [x] 1.1 Confirm the ETF valuation tool route structure in the ETF subpackage and register the new pages without replacing the existing professional ETF pages
- [x] 1.2 Create the page/component folder layout for home, search results, detail, and shared card components following project Vue structure conventions
- [x] 1.3 Define TypeScript models for market sentiment, hot searches, search results, detail payloads, and detail status enums

## 2. Data layer and state handling

- [x] 2.1 Add a dedicated ETF valuation tool API module that wraps the four documented MVP endpoints with Alova request functions
- [x] 2.2 Add page-level request orchestration with `useRequest`, including loading, empty, missing-value, not-found, and fallback states
- [x] 2.3 Prepare development mock/default data paths so the UI can be verified before real APIs are fully available

## 3. Home and search experiences

- [x] 3.1 Implement the home page headline, search bar, market sentiment card, hot-search list, newcomer guidance, and disclaimer based on the PRD and reference layout
- [x] 3.2 Implement the search submission flow and results page with novice-friendly summary cards, tags, and empty-state guidance
- [x] 3.3 Support hot-search interactions so users can jump into the intended search or detail flow from the home page

## 4. Detail experience and UI restoration

- [x] 4.1 Implement the detail page identity card, today's summary card, quick facts section, underlying explanation, target audience block, and disclaimer
- [x] 4.2 Implement non-ok detail states for `loading`, `not_found`, `missing_value`, and unexpected request failure without allowing blank-screen behavior
- [x] 4.3 Restore the mobile card-based visual hierarchy from the reference site using UnoCSS tokens, Wot-compatible structure, and project typography/color constraints

## 5. Validation and delivery

- [ ] 5.1 Verify route navigation and page states manually across home, search, detail, and fallback scenarios
- [x] 5.2 Run repository linting and fix any style or typing issues introduced by the new ETF valuation tool files
- [x] 5.3 Confirm the implementation matches `src/subPages/etf/docs/prd.md`, `src/subPages/etf/docs/api.md`, and the reference site structure before applying the change
