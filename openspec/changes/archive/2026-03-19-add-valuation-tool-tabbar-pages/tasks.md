## 1. Tabbar Model

- [x] 1.1 Refactor `src/composables/useTabbar.ts` to support multiple tab groups, including an app-level group and a valuation-tool group.
- [x] 1.2 Update `src/layouts/tabbar.vue` so it resolves the active tab list from the current route and keeps the active tab in sync when users switch first-level pages.
- [x] 1.3 Verify that existing app-level tabbar pages (`home/about`) still render and switch correctly after the tabbar model changes.

## 2. Valuation Tool First-Level Pages

- [x] 2.1 Move valuation-tool home, watchlist, and holdings pages onto the shared tabbar layout and register stable route-name mappings for the three first-level tabs.
- [x] 2.2 Update valuation-tool home page navigation so first-level switching relies on the tabbar instead of duplicated in-page watchlist/portfolio shortcuts.
- [x] 2.3 Update watchlist and holdings pages so empty states, loading states, and populated states all keep the valuation-tool tabbar visible without content overlap.

## 3. Secondary Navigation and Regression

- [x] 3.1 Keep search, detail, sync, edit, upload, and mine-scan pages outside the valuation-tool tabbar group while preserving stable navigation back into the three first-level pages.
- [x] 3.2 Adjust helper route builders or page actions that currently hardcode `/subPages/valuation-tool/index`, `/watchlist`, or `/holdings` assumptions so they behave correctly with the new first-level tab structure.
- [x] 3.3 Run targeted validation for the valuation-tool navigation flow, including tab switching, empty states, and bottom safe-area layout on home, watchlist, and holdings pages.

Validation note: completed via route/layout code-path verification plus manual smoke testing in the user environment for valuation-tool pages. App-level `home/about` verification was completed through route-name, tab-group, and tabbar registration checks. Automated H5 build/runtime validation remained blocked by the existing `uni build` watcher `EMFILE` issue in this workspace.
