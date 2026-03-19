## MODIFIED Requirements

### Requirement: ETF valuation tool home experience
The system SHALL provide a dedicated ETF valuation tool home page for novice users, and the page MUST include a headline, a search entry, a market sentiment card, a hot-search list, newcomer guidance, a risk disclaimer, and stable bottom navigation entries for watchlist and portfolio access consistent with the documented product positioning.

#### Scenario: User lands on the home page
- **WHEN** the user opens the ETF valuation tool entry
- **THEN** the system shows a lightweight mobile page with the search input as the primary action
- **AND** the system shows the current market sentiment card and hot-search content below the search area
- **AND** the system shows newcomer guidance and a non-investment disclaimer on the same page
- **AND** the bottom area provides clear entry points for watchlist and portfolio-related follow-up actions

#### Scenario: Market sentiment data is unavailable
- **WHEN** the market sentiment request fails or returns no usable data
- **THEN** the system shows a fallback explanatory message instead of leaving the card blank
- **AND** the home page remains usable for search, watchlist navigation, portfolio navigation, and hot-search navigation

#### Scenario: User opens portfolio from home
- **WHEN** the user taps the portfolio entry in the home page bottom action area
- **THEN** the system navigates to the dedicated “我的持仓” module
- **AND** the action area remains visually consistent with the home page’s light-finance mobile style
