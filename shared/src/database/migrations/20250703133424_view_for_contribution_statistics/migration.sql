CREATE VIEW contribution_statistics AS
WITH base AS (
    SELECT
        c.amount,
        c.fees_chf,
        u.id AS user_id,
        u.institution,
        u.address_country AS country,
        c.source,
        c.currency,
        DATE_TRUNC('month', c.created_at) AS month
    FROM contribution c
    JOIN contributor contributor ON c.contributor_id = contributor.id
    JOIN "user" u ON contributor.user_id = u.id
    WHERE u.test_user = FALSE
),

    by_is_institution AS (
    SELECT
    institution,
    SUM(amount) AS amount,
    COUNT(DISTINCT user_id) AS users_count
    FROM base
    GROUP BY institution
),

    by_currency AS (
    SELECT
    currency,
    SUM(amount) AS amount,
    COUNT(DISTINCT user_id) AS users_count
    FROM base
    GROUP BY currency
),

    by_country AS (
    SELECT
    country,
    SUM(amount) AS amount,
    COUNT(DISTINCT user_id) AS users_count
    FROM base
    GROUP BY country
),

    by_source AS (
    SELECT
    source,
    SUM(amount) AS amount,
    COUNT(DISTINCT user_id) AS users_count
    FROM base
    GROUP BY source
),

    by_month AS (
    SELECT
    TO_CHAR(month, 'YYYY-MM') AS month,
    SUM(amount) AS amount,
    COUNT(DISTINCT user_id) AS users_count
    FROM base
    GROUP BY month
),

    by_month_and_type AS (
    SELECT
    TO_CHAR(month, 'YYYY-MM') AS month,
    SUM(CASE WHEN institution = TRUE THEN amount ELSE 0 END) AS institutional,
    SUM(CASE WHEN institution = FALSE THEN amount ELSE 0 END) AS individual
    FROM base
    GROUP BY month
),

    fees_by_is_institution AS (
    SELECT
    institution,
    SUM(fees_chf) AS amount
    FROM base
    GROUP BY institution
)

SELECT
    row_number() OVER () AS id,

            -- Totals
    (SELECT COUNT(*) FROM base) AS total_contributions_count,
    (SELECT SUM(amount) FROM base) AS total_contributions_amount,
    (SELECT COUNT(DISTINCT user_id) FROM base) AS total_contributors_count,

    -- Individual totals
    (SELECT amount FROM by_is_institution WHERE institution = FALSE) AS total_individual_contributions_amount,
    (SELECT users_count FROM by_is_institution WHERE institution = FALSE) AS total_individual_contributors_count,

    -- Institutional totals
    (SELECT amount FROM by_is_institution WHERE institution = TRUE) AS total_institutional_contributions_amount,
    (SELECT users_count FROM by_is_institution WHERE institution = TRUE) AS total_institutional_contributors_count,

    -- Aggregated arrays
    (SELECT json_agg(row_to_json(by_currency)) FROM by_currency) AS total_contributions_by_currency,
    (SELECT json_agg(row_to_json(by_is_institution)) FROM by_is_institution) AS total_contributions_by_is_institution,
    (SELECT json_agg(row_to_json(by_country)) FROM by_country) AS total_contributions_by_country,
    (SELECT json_agg(row_to_json(by_source)) FROM by_source) AS total_contributions_by_source,
    (SELECT json_agg(row_to_json(by_month)) FROM by_month) AS total_contributions_by_month,
    (SELECT json_agg(row_to_json(by_month_and_type)) FROM by_month_and_type) AS total_contributions_by_month_and_type,
    (SELECT json_agg(row_to_json(fees_by_is_institution)) FROM fees_by_is_institution) AS total_payment_fees_by_is_institution;
