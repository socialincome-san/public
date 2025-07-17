CREATE VIEW contribution_statistics AS
WITH base_contributions AS (
    SELECT
        contribution.amount,
        contribution.fees_chf AS payment_fees,
        "user".id AS user_id,
        "user".institution AS is_institution,
        "user".address_country AS country,
        contribution.source,
        contribution.currency,
        DATE_TRUNC('month', contribution.created_at) AS month
    FROM contribution
    JOIN contributor ON contribution.contributor_id = contributor.id
    JOIN "user" ON contributor.user_id = "user".id
),

    contributions_by_institution AS (
    SELECT
    is_institution,
    SUM(amount) AS amount,
    COUNT(DISTINCT user_id) AS users_count
    FROM base_contributions
    GROUP BY is_institution
),

    contributions_by_currency AS (
    SELECT
    currency,
    SUM(amount) AS amount,
    COUNT(DISTINCT user_id) AS users_count
    FROM base_contributions
    GROUP BY currency
),

    contributions_by_country AS (
    SELECT
    country,
    SUM(amount) AS amount,
    COUNT(DISTINCT user_id) AS users_count
    FROM base_contributions
    GROUP BY country
),

    contributions_by_source AS (
    SELECT
    source,
    SUM(amount) AS amount,
    COUNT(DISTINCT user_id) AS users_count
    FROM base_contributions
    GROUP BY source
),

    contributions_by_month AS (
    SELECT
    TO_CHAR(month, 'YYYY-MM') AS month,
    SUM(amount) AS amount,
    COUNT(DISTINCT user_id) AS users_count
    FROM base_contributions
    GROUP BY month
),

    contributions_by_month_and_type AS (
    SELECT
    TO_CHAR(month, 'YYYY-MM') AS month,
    SUM(CASE WHEN is_institution = TRUE THEN amount ELSE 0 END) AS institutional,
    SUM(CASE WHEN is_institution = FALSE THEN amount ELSE 0 END) AS individual
    FROM base_contributions
    GROUP BY month
),

    payment_fees_by_institution AS (
    SELECT
    is_institution,
    SUM(payment_fees) AS amount
    FROM base_contributions
    GROUP BY is_institution
)

SELECT
    ROW_NUMBER() OVER () AS id,

    -- Totals
    (SELECT COUNT(*) FROM base_contributions) AS total_contributions_count,
    (SELECT SUM(amount) FROM base_contributions) AS total_contributions_amount,
    (SELECT COUNT(DISTINCT user_id) FROM base_contributions) AS total_contributors_count,

    -- Individual totals
    (SELECT amount FROM contributions_by_institution WHERE is_institution = FALSE) AS total_individual_contributions_amount,
    (SELECT users_count FROM contributions_by_institution WHERE is_institution = FALSE) AS total_individual_contributors_count,

    -- Institutional totals
    (SELECT amount FROM contributions_by_institution WHERE is_institution = TRUE) AS total_institutional_contributions_amount,
    (SELECT users_count FROM contributions_by_institution WHERE is_institution = TRUE) AS total_institutional_contributors_count,

    -- Aggregated arrays
    (SELECT json_agg(row_to_json(contributions_by_currency)) FROM contributions_by_currency) AS total_contributions_by_currency,
    (SELECT json_agg(row_to_json(contributions_by_institution)) FROM contributions_by_institution) AS total_contributions_by_is_institution,
    (SELECT json_agg(row_to_json(contributions_by_country)) FROM contributions_by_country) AS total_contributions_by_country,
    (SELECT json_agg(row_to_json(contributions_by_source)) FROM contributions_by_source) AS total_contributions_by_source,
    (SELECT json_agg(row_to_json(contributions_by_month)) FROM contributions_by_month) AS total_contributions_by_month,
    (SELECT json_agg(row_to_json(contributions_by_month_and_type)) FROM contributions_by_month_and_type) AS total_contributions_by_month_and_type,
    (SELECT json_agg(row_to_json(payment_fees_by_institution)) FROM payment_fees_by_institution) AS total_payment_fees_by_is_institution;