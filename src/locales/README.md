# Localization Rules & Style Guide

This folder contains the Fluent (`.ftl`) translation files for Splitz across supported locales (`en` and `zh-cn`). Follow these rules whenever adding or editing strings.

## 1. File & Key Conventions

- **Key parity**: Every `.ftl` file in `en/` must have a matching file in `zh-cn/` with the exact same message IDs in the same order.
- **No duplicate keys**: All `.ftl` files in a locale are loaded into a single `FluentBundle` in [`src/main.ts`](../main.ts). Every message ID must be globally unique across all files in that locale.
- **Naming pattern**: Prefix every key with the file/feature namespace in kebab-case:
  - `<feature>-<section>-<element>` (for example, `new-expense-split-title`, `profile-add-friend-submit`, `notification-empty-title`).
  - Category keys use `categories-<subcategory>` and `main_categories-<main_category>` with snake_case category identifiers to match backend/store values.
- **Placeholders**: Keep variable names identical across locales (for example, `{ $count }`, `{ $name }`, `{ $amount }`, `{ $seconds }`).

## 2. Fluent Syntax & Plurals

- **English (`en`)**: Use CLDR plural categories (`[one]` and `*[other]`, plus `[0]` when a zero state reads better) whenever a number variable modifies a countable noun:
  ```ftl
  new-expense-split-summary-included =
      { $count ->
          [one] Included ({ $count } person)
         *[other] Included ({ $count } people)
      }
  ```
- **Simplified Chinese (`zh-cn`)**: Chinese nouns do not inflect for singular vs. plural (`[one]` vs. `*[other]`). Use a single string (`已选 { $count } 笔`, `{ $count } 份`) unless `[0]` requires completely different wording without a number:
  ```ftl
  group-invite-submit =
      { $count ->
          [0] 发送邀请
         *[other] 发送 { $count } 份邀请
      }
  ```

## 3. Tone & Human Writing

Write for people splitting everyday expenses with friends, not for an enterprise accounting system. Follow the [`humanizer`](../../.agents/skills/humanizer/SKILL.md) guidelines:

- **Direct and conversational**: State what happened and what the user can do next.
  - Good (`en`): `Couldn't read the receipt. Try a clearer photo.`
  - Avoid (`en`): `The receipt could not be read. Try a sharper photo.`
  - Good (`zh-cn`): `没能识别出小票内容，请换一张更清晰的照片试试。`
  - Avoid (`zh-cn`): `无法识别这张收据，请换一张更清晰的照片。`
- **Active voice & contractions (`en`)**: Use natural contractions (`Couldn't`, `Isn't`, `You're`, `Don't`) in errors, hints, and descriptions instead of stiff passive constructions (`could not be requested right now`, `is not configured for this environment`).
- **Idiomatic Chinese (`zh-cn`)**: Avoid translationese (翻译腔), unnecessary passive `被` sentences, and stiff nouns (`您的`, `此交易`, `创建组`).
  - Always use `你` (never mix `你` and `您`).
  - Use everyday terms for categories (for example, `买菜生鲜` for groceries, `打车` for ride hailing, `物业费` for HOA fees, `看病门诊` for doctor, `生活缴费` for utilities).

## 4. Terminology Glossary

Use consistent terms across every screen and notification:

| Concept                     | English (`en`)                  | Chinese (`zh-cn`)           | Notes / Avoid                                                                 |
| --------------------------- | ------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| Group                       | group                           | 群组                        | Avoid bare `组`                                                               |
| Friend                      | friend                          | 好友                        | Avoid mixing `朋友` in UI labels/titles (`朋友` is fine in casual body prose) |
| Expense / Transaction       | expense                         | 支出 (or 记一笔 for action) | Avoid `交易` or `费用` in user-facing copy                                    |
| Invoice (settlement batch)  | invoice                         | 结算单                      | Avoid `账单` (collides with utility bills)                                    |
| Settlement / Payment        | payment / settle up             | 还款 / 结算                 | Avoid literal `记录了一笔结算` when referring to a payment                    |
| Receipt                     | receipt                         | 小票                        | Avoid formal `收据`                                                           |
| Nickname / Remark           | nickname                        | 备注名                      | Consistent across add/edit friend sheets                                      |
| Positive balance (creditor) | You are owed / is owed          | 你应收 / 应收               | Avoid `You lent` / `你借出` (inaccurate for multi-way splits)                 |
| Negative balance (debtor)   | You owe / owes                  | 你应还 / 应还 (or 欠)       | Avoid `borrowed` / `借入`                                                     |
| Current user pronoun        | You                             | 你                          | Used as a subject in `{ $name } paid` and split rows; never `我`              |
| Two-factor authentication   | two-factor authentication / 2FA | 两步验证 / 两步验证码       | Avoid raw `2FA` in Chinese labels                                             |
| Recovery codes              | recovery codes                  | 备用恢复码                  | Avoid vague `恢复代码`                                                        |

## 5. Casing & Punctuation

### English (`en`)

- **Sentence case everywhere**: Use sentence case for page titles, section headers, buttons, tabs, form labels, and placeholders (`Create group`, `Split options`, `Total balance`, `Select all`). Capitalize only the first word and proper nouns/acronyms (`OpenStreetMap Nominatim`, `OpenAI`, `2FA`, `ID`, `QR`, `HOA`, `ATM`, `TV`, `SPA`).
- **Ellipsis**: Always use the single character `…` (`U+2026`), never three periods `...`.
- **Units**: Put a space between numbers and units (`10 MB`, `{ $maxMb } MB`).
- **No trailing periods** on short titles, button labels, toast confirmations (`Saved`, `Link copied`), or single-phrase placeholders. Use periods on full sentences and multi-sentence hints/errors.

### Simplified Chinese (`zh-cn`)

- **Full-width punctuation**: Use Chinese punctuation (`，`, `。`, `：`, `（`, `）`, `？`, `！`, `、`) in Chinese text. Never use half-width commas, colons, or parentheses (`付款人：{ $username }`, `已包含（{ $count } 人）`).
- **Quotation marks**: Use corner brackets `「…」` when quoting user-supplied names inline (for example, `{ $creator } 添加了「{ $name }」`).
- **Spacing around variables and Latin/numbers**: Leave a single space between Chinese characters and `{ $variables }`, Latin words, or numbers (`{ $name } 付了 { $amount }`, `请在 { $seconds } 秒后重试`, `输入 6 位数字验证码`).
- **Ellipsis**: Use `…` (`加载中…`, `正在识别…`).
