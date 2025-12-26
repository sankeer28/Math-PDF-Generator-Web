/**
 * Measurement Subject Configuration
 * Time, length, weight, volume, temperature, and conversions
 * Critical for K-8 curriculum alignment
 */

export const measurement = {
    id: 'measurement',
    name: 'Measurement & Data',
    description: 'Measuring length, weight, volume, time, and temperature with conversions',
    icon: 'ruler',

    // Topics organized by concept
    topics: {
        'length': {
            id: 'length',
            name: 'Length & Distance',
            description: 'Measuring and comparing lengths using standard and metric units',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Measuring with ruler in inches/centimeters',
                medium: 'Converting between units (feet to inches, meters to centimeters)',
                hard: 'Complex conversions and perimeter of irregular shapes'
            }
        },

        'weight-mass': {
            id: 'weight-mass',
            name: 'Weight & Mass',
            description: 'Measuring weight/mass using pounds, ounces, grams, kilograms',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Comparing weights (heavier/lighter)',
                medium: 'Measuring and converting (ounces to pounds, grams to kilograms)',
                hard: 'Multi-step conversion problems'
            }
        },

        'capacity-volume': {
            id: 'capacity-volume',
            name: 'Capacity & Volume',
            description: 'Measuring liquid volume and capacity',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Cups, pints, quarts, gallons concepts',
                medium: 'Converting between units (cups to quarts, liters to milliliters)',
                hard: 'Complex volume problems with multiple conversions'
            }
        },

        'time': {
            id: 'time',
            name: 'Time & Elapsed Time',
            description: 'Telling time, reading clocks, calculating elapsed time',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Telling time to hour and half-hour',
                medium: 'Telling time to 5 minutes and calculating simple elapsed time',
                hard: 'Complex elapsed time across days, weeks, and time zones'
            }
        },

        'temperature': {
            id: 'temperature',
            name: 'Temperature',
            description: 'Reading thermometers and understanding temperature scales',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Reading thermometer in Fahrenheit or Celsius',
                medium: 'Comparing temperatures and understanding freezing/boiling points',
                hard: 'Converting between Fahrenheit and Celsius'
            }
        },

        'money': {
            id: 'money',
            name: 'Money & Currency',
            description: 'Counting money, making change, and financial calculations',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Identifying coins and bills, counting small amounts',
                medium: 'Making change and adding/subtracting money amounts',
                hard: 'Multi-step money problems with tax, discount, and tips'
            }
        },

        'metric-customary': {
            id: 'metric-customary',
            name: 'Metric & Customary Systems',
            description: 'Understanding and converting between measurement systems',
            grades: ['middle', 'high'],
            difficulty: {
                easy: 'Basic metric units (meter, liter, gram)',
                medium: 'Converting within metric system (km to m, L to mL)',
                hard: 'Converting between metric and customary systems'
            }
        },

        'unit-conversions': {
            id: 'unit-conversions',
            name: 'Unit Conversions',
            description: 'Converting between different units of measurement',
            grades: ['elementary', 'middle', 'high'],
            difficulty: {
                easy: 'Simple conversions (feet to inches, hours to minutes)',
                medium: 'Multi-step conversions (yards to feet to inches)',
                hard: 'Complex unit conversions with rates and ratios'
            }
        }
    }
};
