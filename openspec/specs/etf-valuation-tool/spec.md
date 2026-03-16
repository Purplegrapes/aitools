## ADDED Requirements

### Requirement: ETF valuation tool home experience
The system SHALL provide a dedicated ETF valuation tool home page inside the ETF subpackage for novice users, and the page MUST include a headline, a search entry, a market sentiment card, a hot-search list, newcomer guidance, and a risk disclaimer consistent with the documented product positioning.

#### Scenario: User lands on the home page
- **WHEN** the user opens the ETF valuation tool entry
- **THEN** the system shows a lightweight mobile page with the search input as the primary action
- **AND** the system shows the current market sentiment card and hot-search content below the search area
- **AND** the system shows newcomer guidance and a non-investment disclaimer on the same page

#### Scenario: Market sentiment data is unavailable
- **WHEN** the market sentiment request fails or returns no usable data
- **THEN** the system shows a fallback explanatory message instead of leaving the card blank
- **AND** the home page remains usable for search and hot-search navigation

### Requirement: ETF valuation tool search results
The system SHALL support fund name or code search and present results in a novice-friendly list that emphasizes plain-language understanding over professional metrics.

#### Scenario: Search returns matching funds
- **WHEN** the user submits a valid keyword and the search API returns items
- **THEN** the system shows a search results page with fund name, code, plain-language summary, type tags, and today's status tag for each result
- **AND** each result provides a clear action to continue to the detail page

#### Scenario: Search returns no results
- **WHEN** the user submits a keyword and the search API returns an empty list
- **THEN** the system shows a friendly empty state
- **AND** the empty state suggests trying a shorter or more common keyword
- **AND** the system MUST NOT expose raw technical errors to the user

### Requirement: ETF valuation tool detail states
The system SHALL provide a dedicated detail page that maps the documented result statuses into explicit user-facing states without breaking the reading flow.

#### Scenario: Detail request returns a normal result
- **WHEN** the detail API returns `status = ok`
- **THEN** the system shows the fund identity card, today's summary, quick facts, underlying explanation, target audience, and disclaimer
- **AND** the content uses short, novice-friendly wording instead of professional trading terminology

#### Scenario: Detail request returns a documented non-ok status
- **WHEN** the detail API returns `status = not_found`, `missing_value`, or `loading`
- **THEN** the system shows a dedicated state page or state card matching that status
- **AND** the user can understand what happened and what to do next without seeing a blank screen

#### Scenario: Detail request fails unexpectedly
- **WHEN** the detail API request errors due to network or runtime failure
- **THEN** the system shows a stable fallback explanation
- **AND** the page still provides a path back to search or home

### Requirement: Reference-site-aligned mobile UI
The system SHALL implement the ETF valuation tool with a mobile-first card layout aligned to the structure and visual rhythm of `https://eagle-lake-83678538.paico.site`, while conforming to project styling conventions.

#### Scenario: Page layout is rendered on mobile
- **WHEN** a user views the home page, search results page, or detail page on a mobile viewport
- **THEN** the system uses a light background, white card surfaces, rounded corners, compact spacing, and status tags arranged in clear visual groups
- **AND** the implementation uses project-approved UnoCSS tokens, typography limits, and component conventions instead of ad hoc styling

#### Scenario: Important information hierarchy is displayed
- **WHEN** the page renders primary values, titles, and supporting explanations
- **THEN** the system prioritizes the search box, card titles, key values, and plain-language explanations in the same top-down reading order as the reference experience
- **AND** secondary disclaimers and helper text remain visible but visually de-emphasized

### Requirement: ETF valuation tool data contract
The system SHALL consume the documented MVP API set and keep page behavior aligned with the response contract described in `src/subPages/etf/docs/api.md`.

#### Scenario: Home page requests data
- **WHEN** the home page initializes
- **THEN** the system requests market sentiment and hot-search data from their documented endpoints
- **AND** the response fields are mapped into the corresponding cards without requiring undocumented fields

#### Scenario: Search and detail pages request data
- **WHEN** the user searches or opens a detail page
- **THEN** the system calls the documented search and detail endpoints with the expected parameters
- **AND** the implementation preserves the documented response semantics, including `items = []` for empty search and `status` for detail state switching
