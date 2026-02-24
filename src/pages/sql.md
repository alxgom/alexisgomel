---
layout: ../layouts/MainLayout.astro
title: SQL Interview Prep
description: Senior Data Analyst SQL Technical Interview Prep (BigQuery).
currentLang: en
---

<style>
  .blog-wrap {
    max-width: 860px;
    margin: 0 auto;
    padding: 120px 24px 80px;
    line-height: 1.8;
    font-size: 1.05rem;
    color: #333;
  }
  .blog-wrap h1 { font-weight: 700; margin-bottom: 0.5rem; font-size: clamp(1.4rem, 4vw, 1.8rem); line-height: 1.3;}
  .blog-wrap h2 { font-weight: 700; margin-top: 2.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f0f0f0; padding-bottom: 0.3rem; font-size: 1.5rem;}
  .blog-wrap h3 { font-weight: 700; margin-top: 2rem; margin-bottom: 0.5rem; font-size: 1.25rem;}
  .blog-wrap pre { background: #f4f4f4; padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.9rem; line-height: 1.5; margin: 1.5rem 0; }
  .blog-wrap code { font-family: monospace; background: #f8f8f8; padding: 2px 4px; border-radius: 4px; color: #e74c3c; }
  .blog-wrap pre code { background: none; padding: 0; color: #333; }
  .blog-wrap table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; }
  .blog-wrap th, .blog-wrap td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  .blog-wrap th { background: #f4f4f4; font-weight: bold; }
  .blog-wrap p { margin-bottom: 1.25rem; }
  .blog-wrap ul, .blog-wrap ol { margin-bottom: 1.25rem; padding-left: 2rem; }
</style>

<div class="blog-wrap">

# Senior Data Analyst SQL Technical Interview Prep (BigQuery)

As a Senior Data Analyst, technical SQL interviews evaluate more than just your ability to pull data. You are expected to write optimized, readable, and robust code that solves complex business problems. Since you are using BigQuery, you should also be familiar with its distinct features, such as processing semi-structured data and using specific optimization techniques.

## Core Concepts to Freshen Up

### 1. Advanced Window Functions

Window functions are the bread and butter of exploratory analysis and complex logic.

- **Ranking:** `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`. Understand the difference (e.g., handling ties).
- **Navigation:** `LEAD()`, `LAG()`, `FIRST_VALUE()`, `LAST_VALUE()`. Extremely useful for time-series analysis or calculating differences over time (e.g., days since last purchase).
- **Framing:** Manipulating the sliding window using clauses like `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.
- **BigQuery specific:** `QUALIFY`. This is a massive time-saver. Instead of wrapping a window function in a CTE to filter on it, you can just use `QUALIFY ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY created_at DESC) = 1` at the end of your query.

### 2. Subqueries and Common Table Expressions (CTEs)

- Use **CTEs (`WITH` clauses)** over nested subqueries. Senior analysts write modular code that is easy for others to read, review, and debug.
- Organize multi-step transformations into logical, sequential CTEs.

### 3. Aggregations & Grouping

- Advanced grouping: `GROUP BY ROLLUP`, `CUBE`, or `GROUPING SETS`.
- Handling conditional aggregations, e.g., `SUM(CASE WHEN status = 'Complete' THEN 1 ELSE 0 END)`.
- **BigQuery specific:** Take advantage of `COUNTIF(condition)` instead of `COUNT(CASE WHEN...)`.

### 4. Working with Nested & Repeated Data (Arrays & Structs)

Since BigQuery heavily utilizes nested data (like Google Analytics exports), this is highly likely to come up during a technical test.

- **`UNNEST()`**: Flattening arrays into rows to join them with parent tables.
- **`ARRAY_AGG()`**: Compressing multiple rows into a single array (very useful for avoiding high-cardinality `JOIN` explosions).
- **`STRUCT`**: Selecting and grouping fields nested inside a struct.

### 5. Joins & Set Operations

- Nuances of `INNER`, `LEFT`, `RIGHT`, `FULL OUTER`, and `CROSS JOIN`.
- Set operations: `UNION ALL` (keeps duplicates, faster), `UNION DISTINCT` (finds uniqueness, involves heavy shuffling), `EXCEPT`, `INTERSECT`.

### 6. Date, Time & String Manipulations

- **Dates/Timestamps:** `DATE_TRUNC()`, `DATE_ADD()`, `DATE_DIFF()`, `EXTRACT()`, `TIMESTAMP_SECONDS()`. These are heavily used in cohort and retention analysis.
- **Strings:** `SUBSTR()`, `REGEXP_CONTAINS()`, `REGEXP_EXTRACT()`, `SPLIT()`.

### 7. Performance & BQ Optimizations

- **Minimizing Scanned Bytes:** Avoid `SELECT *`. BigQuery uses a columnar storage setup.
- **Partitioning & Clustering:** Filtering on partition columns (like dates) early on to reduce costs and drastically improve query times.
- **Avoiding Data Skew:** Understanding how heavily skewed `JOIN` keys can cause resources exceeded errors.

---

## Practice Exercises (Try these in your BQ environment)

Here are 3 exercises built around BigQuery's public datasets. They are modeled after typical senior-level interview questions.

Write the queries on your own, and whenever you are ready, share your answers with me so I can review and grade them!

### Exercise 1: Cohort Retention (TheLook eCommerce)

**Dataset:** `bigquery-public-data.thelook_ecommerce`
**Tables:** `orders`, `users`

**Task:**
Calculate the month-over-month user retention rate.
For users who made their their very first purchase (activation) in each month of **2022**, calculate what percentage of that specific cohort made another purchase in the 1st, 2nd, and 3rd month following their activation month.

_Skills tested:_ Window functions, Date truncating and diffing, CTEs, Conditional Aggregation.

### Exercise 2: Sessionization and Navigation (Google Analytics)

**Dataset:** `bigquery-public-data.google_analytics_sample`
**Tables:** `ga_sessions_20170801` (Just use this single day table for performance)

**Task:**
Find the top 3 most common "next pages" a user visits _immediately after_ landing on the `/home` page path.

_Hint:_ The table schema is heavily nested. You will need to `UNNEST` the `hits` record to view individual pageviews, correctly sequence them by the hit time/number within their respective sessions, and determine the subsequent page element.

_Skills tested:_ `UNNEST`, nested structs (`hits.page.pagePath`), `LEAD()`, Ranking, `QUALIFY`.

### Exercise 3: User Journey Funnel (TheLook eCommerce)

**Dataset:** `bigquery-public-data.thelook_ecommerce`
**Tables:** `events`

**Task:**
Create a daily sequence funnel for the following user journey steps:

1. `home` (visited homepage)
2. `product` (viewed a product)
3. `cart` (added to cart)
4. `purchase` (completed purchase)

For the month of **January 2023**, write a single query that outputs:

- The Date
- Total distinct users who triggered the `home` event.
- Total distinct users who proceeded to trigger the `product` event, `cart` event, and `purchase` event.
- The drop-off percentage from `cart` to `purchase`.

_Skills tested:_ Multi-step funnel logic, Pivot or Conditional aggregation (`COUNTIF`), Grouping.

### Exercise 4: Moving Averages (Austin Bikeshare)

**Dataset:** `bigquery-public-data.austin_bikeshare`
**Tables:** `bikeshare_trips`

**Task:**
Calculate the 7-day rolling average of total daily trips for each start station in the year 2022.

_Skills tested:_ Moving Window Frames (`ROWS BETWEEN X PRECEDING AND CURRENT ROW`), Date extracting, CTEs.

### Exercise 5: Arrays and Aggregation (GitHub Repos)

**Dataset:** `bigquery-public-data.github_repos`
**Tables:** `commits`

**Task:**
Find the top 5 authors (by their `name`) who have authored commits across the _highest number of distinct repositories_ in the year 2022.
Because the `repo_name` column in the `commits` table is an ARRAY, you must UNNEST it to count distinct repos.

_Skills tested:_ `UNNEST`, Nested Structs, Count Distinct.

### Exercise 6: Gaps and Islands (StackOverflow)

**Dataset:** `bigquery-public-data.stackoverflow`
**Tables:** `posts_answers`

**Task:**
Find the user (`owner_user_id`) who had the longest streak of consecutive days posting at least one answer in the year 2020.

_Skills tested:_ Gaps and Islands logic, Window Functions (`ROW_NUMBER`), Date Arithmetic, Aggregation.

### Exercise 7: Hierarchical Data & Self-Joins (Hacker News)

**Dataset:** `bigquery-public-data.hacker_news`
**Tables:** `full`

**Task:**
Find the top 5 stories (`type = 'story'`) in 2021 that generated the most direct replies (`type = 'comment'` where `parent` equals the story's `id`).

_Skills tested:_ Self-Joins, Hierarchical Data, Aggregation.

---

## Common Interview Scenarios (Non-Coding)

During a senior technical interview, the interviewer will often ask open-ended questions about SQL architecture and query optimization. Be prepared to discuss:

1. **How would you optimize a query that is running out of memory (Resources Exceeded)?**
   - _Answer strategy:_ Mention replacing `COUNT(DISTINCT)` with approx methods if exactness isn't needed (`APPROX_COUNT_DISTINCT`), removing unused columns (`SELECT *`), clustering/partitioning the table on frequently filtered columns, filtering data as early as possible before any `JOIN`, and inspecting query plans to spot data skew in `JOIN`s.

2. **Gaps and Islands Problem Logic:**
   - _Answer strategy:_ Explain the standard approach: Extract the dates, assign a `ROW_NUMBER() OVER(ORDER BY date)`, and subtract that `ROW_NUMBER` (in days) from the date. Dates that are consecutive will yield the exact same "base date". You then group by that base date.

3. **When would you use `UNION ALL` vs `UNION DISTINCT`?**
   - _Answer strategy:_ Always default to `UNION ALL` unless deduplication is explicitly required by the business logic. `UNION DISTINCT` triggers a massive sorting and shuffling operation across the entire dataset which ruins performance on large tables.

4. **Explain how you would track the "State" of a user over time (Slowly Changing Dimensions).**
   - _Answer strategy:_ Talk about SCD Type 2 (Valid From / Valid To dates) or using Window functions like `LEAD()` to determine the end date of a state based on the start date of the subsequent state.

---

# Interview Question 4: Tracking the "State" of a user over time (Slowly Changing Dimensions)

**The Question:**
_"Explain how you would track the 'State' of a user over time. For example, if a user upgrades and downgrades their subscription tier over several years, how do you model that in a database?"_

This is a classic Senior Data Analyst / Data Engineer question. It evaluates if you understand **Slowly Changing Dimensions (SCD)**, specifically **SCD Type 2**, and if you know how to query event-based data to build these state tables.

## 1. The Concept: SCD Type 2

When data changes over time (like a user's subscription tier: Free -> Pro -> Premium -> Pro), you can't just overwrite their current tier (SCD Type 1). If you do, you lose the history of what tier they were on during past transactions.

Instead, we use **SCD Type 2**, which adds tracking columns to the dimension table. Every time a user changes state, we create a **new row** with the new state, and we "expire" the old row.

The table structure looks like this:

| user_id | subscription_tier | valid_from | valid_to   | is_current |
| ------- | ----------------- | ---------- | ---------- | ---------- |
| 1       | Free              | 2021-01-01 | 2022-03-15 | FALSE      |
| 1       | Pro               | 2022-03-15 | 2023-10-01 | FALSE      |
| 1       | Premium           | 2023-10-01 | 2099-12-31 | TRUE       |

_Notice that the `valid_to` of one row is exactly equal to the `valid_from` of the next row._

## 2. How to Build It in SQL Using `LEAD()`

Usually, your raw data just looks like an event log (e.g., "User upgraded on 2022-03-15").

To convert a raw event log into an SCD Type 2 table, the `LEAD()` window function is your best friend. `LEAD()` looks ahead to the _next_ row in the partition.

Here is how you answer the question with SQL context:

```sql
-- Step 1: Query the raw event log
WITH raw_events AS (
  SELECT
    user_id,
    new_tier AS subscription_tier,
    event_timestamp AS valid_from
  FROM
    subscription_upgrades
)
-- Step 2: Use LEAD() to find when this state ended
SELECT
  user_id,
  subscription_tier,
  valid_from,

  -- The end date of the CURRENT state is the start date of the NEXT state
  LEAD(valid_from) OVER (PARTITION BY user_id ORDER BY valid_from ASC) AS valid_to,

  -- If there is no next state, this is their current active state!
  CASE
    WHEN LEAD(valid_from) OVER (PARTITION BY user_id ORDER BY valid_from ASC) IS NULL
    THEN TRUE
    ELSE FALSE
  END AS is_current

FROM raw_events;
```

## 3. Why This Matters (The "Senior" Part of the Answer)

To really nail the interview, you should explain _why_ this structure is so important for downstream analysis.

1.  **Point-in-Time Joins:** If you want to know how much revenue a user generated while they were on the 'Pro' tier, you can easily join the `transactions` table to this SCD table by doing:
    `ON t.user_id = s.user_id AND t.transaction_date >= s.valid_from AND t.transaction_date < s.valid_to`
2.  **Performance:** This avoids having to constantly recalculate window functions in your daily BI views. You build this table once overnight, and Looker/Tableau can query the pre-calculated `valid_from` and `valid_to` dates instantly.
3.  **Handling 'Current' State:** In BigQuery, you can use `COALESCE(LEAD(...), CURRENT_TIMESTAMP())` or a far-off future date like `2099-12-31` for the `valid_to` if they are currently in that state. Using `2099-12-31` is a common data warehousing trick so that `BETWEEN` joins always work without worrying about `NULL` values.

---

## Appendix: TL;DR SQL Functions Cheat Sheet (BigQuery)

```sql
/*
===================================================
   TL;DR SQL FUNCTIONS CHEAT SHEET (BigQuery)
===================================================
A quick reference guide for advanced SQL functions that are crucial for Senior Data Analyst interviews and daily work in Google BigQuery.
*/

-- ==========================================
-- 1. WINDOW FUNCTIONS (Navigation & Framing)
-- ==========================================

-- LEAD() and LAG(): Look forward or backward without self-joining.
-- Great for: Finding the time between purchases, or when a subscription state ended (SCD Type 2).
SELECT
  user_id,
  purchase_date,
  -- What was the date of their NEXT purchase?
  LEAD(purchase_date) OVER(PARTITION BY user_id ORDER BY purchase_date ASC) as next_purchase,

  -- What was the date of their PREVIOUS purchase?
  LAG(purchase_date) OVER(PARTITION BY user_id ORDER BY purchase_date ASC) as prev_purchase
FROM purchases;

-- QUALIFY: BigQuery's magic keyword to filter on window functions immediately.
-- Great for: Getting the "latest" row without needing a subquery/CTE.
SELECT
  user_id,
  status,
  updated_at
FROM user_status_logs
WHERE status IS NOT NULL
-- Instead of a CTE with ROW_NUMBER() = 1, just use QUALIFY at the very end!
QUALIFY ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY updated_at DESC) = 1;

-- Moving Averages (Framing):
-- Great for: Smoothing out daily volatility (e.g. 7-day rolling average).
SELECT
  date,
  sales,
  AVG(sales) OVER(
    ORDER BY date
    -- Looks at the 6 days prior + the current row = 7 days total
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as rolling_7d_avg
FROM daily_sales;


-- ==========================================
-- 2. ARRAYS & STRUCTS (Nested Data)
-- ==========================================

-- UNNEST(): Flattens an array into rows.
-- Great for: GA data, GitHub commits, or any dataset with repeated records.
SELECT
  session_id,
  hit.page.pagePath
FROM `ga_sessions`,
  UNNEST(hits) AS hit -- Flattens the 'hits' array so we can query inside it
WHERE hit.type = 'PAGE';

-- ARRAY_AGG(): The opposite of UNNEST. Rolls rows up into an array.
-- Great for: Avoiding massive row explosion when joining 1-to-many tables.
SELECT
  user_id,
  -- Creates a list of all products they bought, keeping it to 1 row per user
  ARRAY_AGG(product_name ORDER BY purchase_date DESC LIMIT 5) as last_5_products
FROM purchases
GROUP BY user_id;


-- ==========================================
-- 3. CONDITIONAL AGGREGATION
-- ==========================================

-- COUNTIF(): BigQuery's cleaner alternative to SUM(CASE WHEN...).
-- Great for: Funnels, pivoting rows to columns, or counting specific events.
SELECT
  country,
  COUNT(user_id) as total_users,
  -- Only counts rows where the condition is TRUE
  COUNTIF(is_premium = TRUE) as premium_users,
  COUNTIF(device_type = 'mobile') as mobile_users
FROM users
GROUP BY country;


-- ==========================================
-- 4. DATES AND TIMESTAMPS
-- ==========================================

-- DATE_TRUNC(): Rounds a date/timestamp down to the beginning of the period.
-- Great for: Monthly cohort analysis or weekly aggregations.
SELECT
  DATE_TRUNC(created_at, MONTH) as cohort_month, -- e.g., '2023-01-15' becomes '2023-01-01'
  COUNT(DISTINCT user_id) as new_users
FROM users
GROUP BY 1;

-- DATE_DIFF(): Finds the difference between two dates.
-- Great for: Retention analysis (e.g., "how many months after activation did they return?").
SELECT
  user_id,
  activation_date,
  purchase_date,
  -- Returns an integer of months between the two dates
  DATE_DIFF(purchase_date, activation_date, MONTH) as months_since_activation
FROM cohort_data;

-- EXTRACT(): Pulls a specific part from a date/timestamp.
-- Great for: Seasonality analysis (e.g., "sales by day of week").
SELECT
  EXTRACT(DAYOFWEEK FROM purchase_date) as day_of_week, -- 1 = Sunday, 7 = Saturday
  EXTRACT(YEAR FROM purchase_date) as purchase_year,
  SUM(revenue) as total_revenue
FROM sales
GROUP BY 1, 2;
```

</div>
