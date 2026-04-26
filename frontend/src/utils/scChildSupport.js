/**
 * South Carolina Child Support Estimator (Client-side)
 *
 * Follows SC Child Support Guidelines simplified logic:
 * - Worksheet A: Standard (sole custody)
 * - 109-overnight threshold for shared custody adjustments
 * - Basic Obligation Schedule lookup table
 * - 1.5x multiplier for combined monthly > $30,000
 */

// SC Basic Obligation Schedule (simplified key values)
// Combined Adjusted Gross Monthly Income -> Monthly Obligation for 1 child
// Values interpolated for common ranges. This is an approximation for estimation.
const OBLIGATION_SCHEDULE = [
    { minIncome: 0, maxIncome: 800, amountByChild: [0, 0, 0, 0, 0, 0] },
    { minIncome: 800, maxIncome: 1200, amountByChild: [0, 100, 100, 100, 100, 100] },
    { minIncome: 1200, maxIncome: 1600, amountByChild: [0, 183, 193, 193, 193, 193] },
    { minIncome: 1600, maxIncome: 2000, amountByChild: [0, 316, 355, 367, 374, 382] },
    { minIncome: 2000, maxIncome: 2400, amountByChild: [0, 371, 445, 477, 497, 515] },
    { minIncome: 2400, maxIncome: 2800, amountByChild: [0, 411, 506, 557, 591, 627] },
    { minIncome: 2800, maxIncome: 3200, amountByChild: [0, 449, 565, 633, 690, 745] },
    { minIncome: 3200, maxIncome: 3600, amountByChild: [0, 488, 625, 711, 789, 869] },
    { minIncome: 3600, maxIncome: 4000, amountByChild: [0, 527, 685, 790, 890, 996] },
    { minIncome: 4000, maxIncome: 4500, amountByChild: [0, 568, 745, 868, 987, 1116] },
    { minIncome: 4500, maxIncome: 5000, amountByChild: [0, 616, 809, 941, 1076, 1226] },
    { minIncome: 5000, maxIncome: 5500, amountByChild: [0, 663, 873, 1014, 1166, 1336] },
    { minIncome: 5500, maxIncome: 6000, amountByChild: [0, 711, 937, 1087, 1256, 1446] },
    { minIncome: 6000, maxIncome: 6500, amountByChild: [0, 758, 1001, 1160, 1346, 1556] },
    { minIncome: 6500, maxIncome: 7000, amountByChild: [0, 806, 1065, 1233, 1436, 1666] },
    { minIncome: 7000, maxIncome: 7500, amountByChild: [0, 854, 1130, 1307, 1526, 1776] },
    { minIncome: 7500, maxIncome: 8000, amountByChild: [0, 902, 1194, 1381, 1616, 1886] },
    { minIncome: 8000, maxIncome: 8500, amountByChild: [0, 950, 1258, 1455, 1706, 1996] },
    { minIncome: 8500, maxIncome: 9000, amountByChild: [0, 998, 1322, 1529, 1796, 2106] },
    { minIncome: 9000, maxIncome: 9500, amountByChild: [0, 1046, 1386, 1603, 1886, 2216] },
    { minIncome: 9500, maxIncome: 10000, amountByChild: [0, 1094, 1450, 1677, 1976, 2326] },
    { minIncome: 10000, maxIncome: 15000, amountByChild: [0, 1500, 2000, 2300, 2600, 2900] },
    { minIncome: 15000, maxIncome: 20000, amountByChild: [0, 2000, 2600, 3000, 3400, 3800] },
    { minIncome: 20000, maxIncome: 25000, amountByChild: [0, 2500, 3200, 3700, 4200, 4700] },
    { minIncome: 25000, maxIncome: 30000, amountByChild: [0, 3000, 3800, 4400, 5000, 5600] },
    // Above $30,000 = 1.5x multiplier applies (handled separately)
];

const MULTIPLIER_THRESHOLD = 30000;
const ONE_O_NINE_CLIFF = 109;

/**
 * Get basic obligation from schedule lookup.
 * Returns [baseObligation, childPortion] where childPortion is per-child amount.
 */
function getBasicObligation(combinedIncome, numChildren) {
    const children = Math.min(numChildren, 6); // Support max 6 children in schedule

    if (combinedIncome > MULTIPLIER_THRESHOLD) {
        // Use $30k row as base, apply 1.5x multiplier later
        const base = OBLIGATION_SCHEDULE[OBLIGATION_SCHEDULE.length - 1];
        return {
            baseAmount: base.amountByChild[children] || 0,
            childCount: children
        };
    }

    for (const bracket of OBLIGATION_SCHEDULE) {
        if (combinedIncome >= bracket.minIncome && combinedIncome < bracket.maxIncome) {
            return {
                baseAmount: bracket.amountByChild[children] || 0,
                childCount: children
            };
        }
    }

    return { baseAmount: 0, childCount: children };
}

/**
 * Estimate monthly child support for SC.
 *
 * @param {Object} params - Calculation parameters
 * @param {number} params.motherIncome - Mother's gross monthly income
 * @param {number} params.fatherIncome - Father's gross monthly income (0 if unknown)
 * @param {number} params.numChildren - Number of children
 * @param {number} params.motherOvernights - Mother's overnights (365 if sole custody)
 * @returns {Object} Estimated support amounts
 */
export function estimateChildSupport(params) {
    const {
        motherIncome = 0,
        fatherIncome = 0,
        numChildren = 1,
        motherOvernights = 365
    } = params;

    const fatherOvernights = 365 - motherOvernights;
    const combinedIncome = motherIncome + fatherIncome;
    const children = Math.min(Math.max(numChildren, 1), 6);

    // Get basic obligation
    let { baseAmount } = getBasicObligation(combinedIncome, children);

    // Apply 1.5x multiplier if combined > $30k
    if (combinedIncome > MULTIPLIER_THRESHOLD) {
        baseAmount = Math.round(baseAmount * 1.5);
    }

    // Shared custody adjustment (both parents have > 109 overnights)
    const motherHasPrimary = motherOvernights >= ONE_O_NINE_CLIFF;
    const fatherHasPrimary = fatherOvernights >= ONE_O_NINE_CLIFF;
    const isShared = motherHasPrimary && fatherHasPrimary;

    // Proportional share
    const motherShare = combinedIncome > 0 ? motherIncome / combinedIncome : 0.5;
    const fatherShare = combinedIncome > 0 ? fatherIncome / combinedIncome : 0.5;

    // Mother's obligation based on income share
    const motherObligation = Math.round(baseAmount * motherShare);
    const fatherObligation = Math.round(baseAmount * fatherShare);

    // Shared custody: adjust by overnights
    let estimatedTransfer = 0;
    if (isShared) {
        // Each parent's proportional obligation
        const adjustedMother = Math.round(motherObligation * (fatherOvernights / 365));
        const adjustedFather = Math.round(fatherObligation * (motherOvernights / 365));

        // Net transfer: if mother has fewer overnights, she owes father
        if (adjustedMother > adjustedFather) {
            estimatedTransfer = adjustedMother - adjustedFather;
        } else {
            estimatedTransfer = -(adjustedFather - adjustedMother);
        }
    } else {
        // Sole custody: non-custodial parent pays their share
        // If mother has primary (>50%), father pays his share
        if (motherHasPrimary && !fatherHasPrimary) {
            estimatedTransfer = fatherObligation;
        } else {
            estimatedTransfer = -motherObligation;
        }
    }

    return {
        combinedIncome,
        baseAmount,
        motherObligation,
        fatherObligation,
        estimatedTransfer,
        isShared,
        motherShare: Math.round(motherShare * 100),
        fatherShare: Math.round(fatherShare * 100),
        motherOvernights,
        fatherOvernights,
        numChildren: children
    };
}
