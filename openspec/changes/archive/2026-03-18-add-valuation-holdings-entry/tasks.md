## 1. Entry Flow Restructure

- [x] 1.1 Replace multiple my-portfolio entry buttons with a single “同步持仓” entry
- [x] 1.2 Add an independent sync-method page to choose manual entry or screenshot sync
- [x] 1.3 Rework the old upload placeholder into a screenshot-oriented flow entry

## 2. Manual Entry Normalization

- [x] 2.1 Keep manual entry as an independent page using the “fund + holding amount + holding profit” contract
- [x] 2.2 Normalize manual save payloads into the shared position save model used by the portfolio module
- [x] 2.3 Verify that manual entry continues to work with existing portfolio summary, list, edit, and delete flows

## 3. Screenshot Recognition Draft Flow

- [x] 3.1 Define the front-end draft/session model for OCR-recognized holdings
- [x] 3.2 Trigger image selection directly from the sync-method page and add loading / failure / empty-recognition states
- [x] 3.3 Build the recognition result confirmation UI as a simple table with delete and reupload actions
- [x] 3.4 Filter out unsuccessful recognition items before entering the confirmation page

## 4. Save And Error Handling

- [x] 4.1 Convert confirmed OCR records into the same final save model used by manual entry
- [x] 4.2 Handle the “no successful items” case with clear fallback states
- [x] 4.3 Add clear fallback actions for full recognition failure, including “重新上传” and “转手动录入”

## 5. API And Verification

- [x] 5.1 Add or stub the screenshot recognition and confirmation import API layer needed by the new flow
- [x] 5.2 Update related docs or integration notes so OCR and confirmation interfaces match the new product flow
- [x] 5.3 Verify the full add-position experience across manual entry, screenshot recognition, confirmation, and portfolio result rendering
