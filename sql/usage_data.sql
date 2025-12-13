-- ChessPecker Usage Analytics Query
-- Returns all stats in a single result set with category and metric columns

WITH
-- 1. Overall user stats
overall_stats AS (
    SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN puzzle_starts > 0 THEN 1 END) as users_started_puzzles,
        COUNT(CASE WHEN set_creates > 0 THEN 1 END) as users_created_sets,
        COUNT(CASE WHEN correct_puzzles >= 100 THEN 1 END) as power_users_100_plus,
        COUNT(CASE WHEN correct_puzzles >= 500 THEN 1 END) as super_users_500_plus,
        ROUND(AVG(correct_puzzles), 1) as avg_correct_per_user,
        ROUND(AVG(set_creates), 1) as avg_sets_per_user,
        MAX(correct_puzzles) as max_puzzles_single_user,
        MAX(set_creates) as max_sets_single_user,
        SUM(hints) as total_hints_used
    FROM "ChessPeckerUsers"
),

-- 2. Engagement tiers
engagement_tiers AS (
    SELECT
        CASE
            WHEN correct_puzzles = 0 THEN '1_never_solved'
            WHEN correct_puzzles BETWEEN 1 AND 10 THEN '2_tried_it_1-10'
            WHEN correct_puzzles BETWEEN 11 AND 50 THEN '3_casual_11-50'
            WHEN correct_puzzles BETWEEN 51 AND 200 THEN '4_regular_51-200'
            WHEN correct_puzzles BETWEEN 201 AND 500 THEN '5_engaged_201-500'
            WHEN correct_puzzles > 500 THEN '6_power_user_500+'
        END as tier,
        COUNT(*) as cnt
    FROM "ChessPeckerUsers"
    GROUP BY 1
),

-- 3. Set creation patterns
set_patterns AS (
    SELECT
        CASE
            WHEN set_creates = 0 THEN '1_zero_sets'
            WHEN set_creates BETWEEN 1 AND 2 THEN '2_one_or_two_sets'
            WHEN set_creates BETWEEN 3 AND 5 THEN '3_three_to_five_sets'
            WHEN set_creates BETWEEN 6 AND 10 THEN '4_six_to_ten_sets'
            WHEN set_creates > 10 THEN '5_more_than_ten_sets'
        END as tier,
        COUNT(*) as cnt
    FROM "ChessPeckerUsers"
    GROUP BY 1
),

-- 4. Hint usage
hint_usage AS (
    SELECT
        CASE
            WHEN hints = 0 THEN '1_never_used'
            WHEN hints BETWEEN 1 AND 10 THEN '2_light_1-10'
            WHEN hints BETWEEN 11 AND 50 THEN '3_moderate_11-50'
            WHEN hints > 50 THEN '4_heavy_50+'
        END as tier,
        COUNT(*) as cnt
    FROM "ChessPeckerUsers"
    GROUP BY 1
),

-- 5. Monthly trends (last 6 months)
monthly_trends AS (
    SELECT
        DATE_TRUNC('month', day)::date as month,
        SUM(correct_puzzles) as correct,
        SUM(incorrect_puzzles) as incorrect,
        SUM(set_creates) as sets_created
    FROM "DailyUsageStats"
    WHERE day >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY 1
    ORDER BY 1 DESC
),

-- 6. User growth by month
user_growth AS (
    SELECT
        DATE_TRUNC('month', created_at)::date as month,
        COUNT(*) as new_users
    FROM "ChessPeckerUsers"
    GROUP BY 1
    ORDER BY 1 DESC
),

-- 7. Set statistics
set_stats AS (
    SELECT
        COUNT(*) as total_sets,
        ROUND(AVG(size), 0) as avg_set_size,
        ROUND(AVG(repeats), 1) as avg_repeats,
        ROUND(AVG(elo), 0) as avg_elo,
        COUNT(CASE WHEN size > 100 THEN 1 END) as sets_over_100,
        COUNT(CASE WHEN size > 300 THEN 1 END) as sets_over_300
    FROM "chessPeckerSets"
),

-- 8. Premium candidates
premium_candidates AS (
    SELECT
        COUNT(*) as users_with_sets,
        COUNT(CASE WHEN set_creates > 5 THEN 1 END) as would_hit_5_set_limit,
        COUNT(CASE WHEN set_creates > 3 THEN 1 END) as would_hit_3_set_limit,
        COUNT(CASE WHEN hints > 0 THEN 1 END) as hint_users,
        COUNT(CASE WHEN hints > 20 THEN 1 END) as heavy_hint_users,
        COUNT(CASE WHEN correct_puzzles > 200 THEN 1 END) as engaged_200_plus,
        COUNT(CASE WHEN correct_puzzles > 500 THEN 1 END) as engaged_500_plus
    FROM "ChessPeckerUsers"
    WHERE set_creates > 0
),

-- 9. Traffic stats (last 30 days)
traffic_stats AS (
    SELECT
        COUNT(*) as total_page_views,
        COUNT(DISTINCT visitor_id) as unique_visitors,
        COUNT(DISTINCT session_id) as total_sessions
    FROM chesspecker_analytics_events
    WHERE ts >= NOW() - INTERVAL '30 days'
)

-- Combine everything into one output
SELECT * FROM (
    -- Section 1: Overall Stats
    SELECT '01_OVERALL' as category, 'total_users' as metric, total_users::text as value FROM overall_stats
    UNION ALL SELECT '01_OVERALL', 'users_started_puzzles', users_started_puzzles::text FROM overall_stats
    UNION ALL SELECT '01_OVERALL', 'users_created_sets', users_created_sets::text FROM overall_stats
    UNION ALL SELECT '01_OVERALL', 'power_users_100+', power_users_100_plus::text FROM overall_stats
    UNION ALL SELECT '01_OVERALL', 'super_users_500+', super_users_500_plus::text FROM overall_stats
    UNION ALL SELECT '01_OVERALL', 'avg_correct_per_user', avg_correct_per_user::text FROM overall_stats
    UNION ALL SELECT '01_OVERALL', 'avg_sets_per_user', avg_sets_per_user::text FROM overall_stats
    UNION ALL SELECT '01_OVERALL', 'max_puzzles_single_user', max_puzzles_single_user::text FROM overall_stats
    UNION ALL SELECT '01_OVERALL', 'max_sets_single_user', max_sets_single_user::text FROM overall_stats
    UNION ALL SELECT '01_OVERALL', 'total_hints_used', total_hints_used::text FROM overall_stats

    -- Section 2: Engagement Tiers
    UNION ALL SELECT '02_ENGAGEMENT', tier, cnt::text FROM engagement_tiers

    -- Section 3: Set Creation Patterns
    UNION ALL SELECT '03_SET_PATTERNS', tier, cnt::text FROM set_patterns

    -- Section 4: Hint Usage
    UNION ALL SELECT '04_HINT_USAGE', tier, cnt::text FROM hint_usage

    -- Section 5: Monthly Trends
    UNION ALL SELECT '05_MONTHLY_' || month::text, 'correct_puzzles', correct::text FROM monthly_trends
    UNION ALL SELECT '05_MONTHLY_' || month::text, 'incorrect_puzzles', incorrect::text FROM monthly_trends
    UNION ALL SELECT '05_MONTHLY_' || month::text, 'sets_created', sets_created::text FROM monthly_trends

    -- Section 6: User Growth
    UNION ALL SELECT '06_USER_GROWTH', month::text, new_users::text FROM user_growth

    -- Section 7: Set Statistics
    UNION ALL SELECT '07_SET_STATS', 'total_sets', total_sets::text FROM set_stats
    UNION ALL SELECT '07_SET_STATS', 'avg_set_size', avg_set_size::text FROM set_stats
    UNION ALL SELECT '07_SET_STATS', 'avg_repeats', avg_repeats::text FROM set_stats
    UNION ALL SELECT '07_SET_STATS', 'avg_elo', avg_elo::text FROM set_stats
    UNION ALL SELECT '07_SET_STATS', 'sets_over_100_puzzles', sets_over_100::text FROM set_stats
    UNION ALL SELECT '07_SET_STATS', 'sets_over_300_puzzles', sets_over_300::text FROM set_stats

    -- Section 8: Premium Candidates
    UNION ALL SELECT '08_PREMIUM', 'users_with_sets', users_with_sets::text FROM premium_candidates
    UNION ALL SELECT '08_PREMIUM', 'would_hit_5_set_limit', would_hit_5_set_limit::text FROM premium_candidates
    UNION ALL SELECT '08_PREMIUM', 'would_hit_3_set_limit', would_hit_3_set_limit::text FROM premium_candidates
    UNION ALL SELECT '08_PREMIUM', 'hint_users', hint_users::text FROM premium_candidates
    UNION ALL SELECT '08_PREMIUM', 'heavy_hint_users_20+', heavy_hint_users::text FROM premium_candidates
    UNION ALL SELECT '08_PREMIUM', 'engaged_200+_puzzles', engaged_200_plus::text FROM premium_candidates
    UNION ALL SELECT '08_PREMIUM', 'engaged_500+_puzzles', engaged_500_plus::text FROM premium_candidates

    -- Section 9: Traffic (30 days)
    UNION ALL SELECT '09_TRAFFIC_30D', 'total_page_views', total_page_views::text FROM traffic_stats
    UNION ALL SELECT '09_TRAFFIC_30D', 'unique_visitors', unique_visitors::text FROM traffic_stats
    UNION ALL SELECT '09_TRAFFIC_30D', 'total_sessions', total_sessions::text FROM traffic_stats
) combined
ORDER BY category, metric;
