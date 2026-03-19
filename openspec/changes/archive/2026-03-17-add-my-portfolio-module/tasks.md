## 1. Information Architecture

- [x] 1.1 Create the my-portfolio page set and route skeletons for empty state, overview, add, edit, upload placeholder, and supporting status views.
- [x] 1.2 Update the valuation-tool home entry flow so the bottom action area routes to the new portfolio module.

## 2. Data and State

- [x] 2.1 Define the portfolio position data model, summary view model, insight view model, and data-unavailable fallback contract.
- [x] 2.2 Add mock or placeholder data sources for manual positions, summary metrics, insight text, loading state, and upload placeholder state.
- [x] 2.3 Wire a portfolio composable or equivalent state layer for add, edit, delete, and summary aggregation flows.

## 3. High-Fidelity Screens

- [x] 3.1 Implement the portfolio empty state page with manual add and upload entry actions.
- [x] 3.2 Implement the add-position page with fund search, share input, cost net value input, and save actions.
- [x] 3.3 Implement the standard portfolio overview page with summary card, insight card, and holding list cards.
- [x] 3.4 Implement the edit-position page or edit sheet with save and delete actions clearly separated.
- [x] 3.5 Implement the upload page as a first-version reserved flow with file-type guidance and stable entry structure.

## 4. Status and Resilience

- [x] 4.1 Implement loading and skeleton states aligned to the final overview layout.
- [x] 4.2 Implement data-unavailable states that preserve holdings and cumulative performance while downgrading intraday metrics.
- [x] 4.3 Ensure the overview highlights strongest, weakest, and worth-watching holdings without using trading-style language.

## 5. Component System and Validation

- [x] 5.1 Extract and style the required high-fidelity components: PortfolioSummaryCard, PositionInsightCard, PositionFundCard, EmptyPortfolioState, AddPositionForm, SearchFundInput, EditPositionSheet, UploadPositionCard, DataUnavailableCard, SkeletonBlock, and BottomActionBar.
- [x] 5.2 Verify mobile typography, spacing, and button/card rules follow the project’s rpx and light-finance design constraints.
- [x] 5.3 Validate the page set against the key UX questions: overall gain/loss clarity, intraday visibility, best/worst holding scanability, simple add flow, assistant-like tone, and safe data-missing behavior.
