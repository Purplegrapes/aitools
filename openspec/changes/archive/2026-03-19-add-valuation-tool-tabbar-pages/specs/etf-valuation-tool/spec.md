## MODIFIED Requirements

### Requirement: ETF valuation tool home experience
The system SHALL provide a dedicated ETF valuation tool home page for novice users, and the page MUST include a headline, a search entry, a market sentiment card, a hot-search list, newcomer guidance, a risk disclaimer, and a persistent valuation-tool tabbar shared with the watchlist page and portfolio page.

#### Scenario: User lands on the home page
- **WHEN** the user opens the ETF valuation tool entry
- **THEN** the system shows a lightweight mobile page with the search entry as the primary action
- **AND** the system shows the current market sentiment card and hot-search content below the search area
- **AND** the system shows newcomer guidance and a non-investment disclaimer on the same page
- **AND** the bottom area shows a valuation-tool tabbar with Home, Watchlist, and Portfolio tabs
- **AND** the Home tab is highlighted as the active first-level page

#### Scenario: Market sentiment data is unavailable
- **WHEN** the market sentiment request fails or returns no usable data
- **THEN** the system shows a fallback explanatory message instead of leaving the card blank
- **AND** the home page remains usable for search, watchlist navigation, portfolio navigation, and hot-search navigation
- **AND** the valuation-tool tabbar remains visible and functional

#### Scenario: User switches first-level pages from home
- **WHEN** the user taps the Watchlist tab or Portfolio tab from the home page
- **THEN** the system switches to the corresponding valuation-tool first-level page
- **AND** the destination page is shown without requiring an in-page shortcut button to complete the navigation

## ADDED Requirements

### Requirement: ETF valuation tool SHALL Provide Product-Level Tabbar Navigation
The system SHALL define the valuation-tool home page as one member of a dedicated valuation-tool tabbar group, and this tabbar group SHALL be separate from the application-level home/about tabbar group.

#### Scenario: Home page renders inside the valuation-tool tabbar group
- **WHEN** the valuation-tool home page is rendered
- **THEN** the page SHALL use the shared tabbar layout and valuation-tool-specific tab definitions
- **AND** the displayed tab titles SHALL correspond to Home, Watchlist, and Portfolio or equivalent user-facing labels

#### Scenario: Home page does not duplicate first-level navigation
- **WHEN** the valuation-tool home page already shows the persistent tabbar
- **THEN** the page SHALL NOT rely on duplicated first-level navigation controls to reach watchlist and portfolio
- **AND** any remaining page-level controls SHALL focus on business actions such as search or hot-entry actions
