CREATE VIEW contribution_stats AS
SELECT
    row_number() OVER () AS id,
    COUNT(*) AS total_contributions_count,
    SUM(amount) AS total_contributions_amount,
    COUNT(DISTINCT contributor_id) AS total_contributors_count,
    SUM(CASE WHEN u.institution = FALSE THEN c.amount ELSE 0 END) AS total_individual_contributions_amount,
    COUNT(DISTINCT CASE WHEN u.institution = FALSE THEN c.contributor_id ELSE NULL END) AS total_individual_contributors_count
FROM contribution c
         JOIN contributor ctr ON c.contributor_id = ctr.id
         JOIN "user" u ON ctr.user_id = u.id;