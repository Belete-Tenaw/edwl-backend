/**
 * economicService.js
 * 
 * Tracks macroeconomic indicators for Ethiopia to keep EDWL salary benchmarks
 * accurate and fair even during high-inflation periods.
 *
 * In production this would fetch from a live data source (e.g. World Bank API,
 * National Bank of Ethiopia bulletin). For now it uses a curated, annually-
 * reviewed static table with a clear override path via the INFLATION_MULTIPLIER
 * environment variable.
 */

/**
 * Historical Ethiopian year-on-year CPI inflation reference table.
 * Source: National Bank of Ethiopia / IMF Article IV Reports.
 * These represent cumulative multipliers relative to a 2022 ETB baseline.
 */
const ETHIOPIA_INFLATION_INDEX = {
    2022: 1.00,  // baseline
    2023: 1.26,  // ~26% YoY inflation
    2024: 1.52,  // ~20% YoY
    2025: 1.74,  // ~15% YoY (slowing)
    2026: 1.95,  // ~12% YoY projected
};

/**
 * Returns the inflation multiplier for the current year.
 * This is the factor by which 2022-baseline salaries must be scaled
 * to reflect today's purchasing power.
 *
 * Override at runtime: set INFLATION_MULTIPLIER env var (e.g. "2.1")
 * Override for a specific year: set INFLATION_YEAR env var (e.g. "2025")
 *
 * @returns {number} multiplier, always >= 1.0
 */
exports.getInflationMultiplier = () => {
    // 1. Hard env-var override (deployment-time tuning)
    if (process.env.INFLATION_MULTIPLIER) {
        const override = parseFloat(process.env.INFLATION_MULTIPLIER);
        if (!isNaN(override) && override >= 1.0) return override;
    }

    // 2. Look up by year
    const year = parseInt(process.env.INFLATION_YEAR) || new Date().getFullYear();
    const multiplier = ETHIOPIA_INFLATION_INDEX[year];

    // 3. If the year is beyond our table, extrapolate using the last known value
    //    with a conservative 10% annual growth assumption.
    if (!multiplier) {
        const lastKnownYear = Math.max(...Object.keys(ETHIOPIA_INFLATION_INDEX).map(Number));
        const lastKnownValue = ETHIOPIA_INFLATION_INDEX[lastKnownYear];
        const yearsAhead = Math.max(0, year - lastKnownYear);
        return parseFloat((lastKnownValue * Math.pow(1.10, yearsAhead)).toFixed(4));
    }

    return multiplier;
};

/**
 * Returns a human-readable summary of current economic conditions
 * for display in admin dashboards and salary insights.
 *
 * @returns {{ year: number, multiplier: number, adjustedLabel: string }}
 */
exports.getEconomicContext = () => {
    const year = parseInt(process.env.INFLATION_YEAR) || new Date().getFullYear();
    const multiplier = exports.getInflationMultiplier();
    const pctAboveBaseline = ((multiplier - 1) * 100).toFixed(0);

    return {
        year,
        multiplier,
        baselineYear: 2022,
        adjustedLabel: `Salaries reflect ~${pctAboveBaseline}% cumulative inflation since 2022 (ETB baseline)`,
        dataSource: 'National Bank of Ethiopia / EDWL Economic Index'
    };
};
