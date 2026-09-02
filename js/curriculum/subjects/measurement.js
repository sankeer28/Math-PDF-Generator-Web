/**
 * Measurement Subject Configuration
 * Time, length, weight, volume, temperature, and conversions
 * Critical for K-8 curriculum alignment
 */

import { gradeRange } from '../config/grades.js';

export const measurement = {
    id: 'measurement',
    name: 'Measurement',
    description: 'Length, mass, capacity, time, temperature and unit conversion',
    icon: 'ruler',
    strand: 'E',

    // Topics organized by concept
    topics: {
        'length': {
            id: 'length',
            name: 'Length & Distance',
            description: 'Measuring and comparing lengths using standard and metric units',
            strand: 'E',
            grades: gradeRange(1, 8),
            difficulty: {
                easy: 'Measuring with ruler in inches/centimeters',
                medium: 'Converting between units (feet to inches, meters to centimeters)',
                hard: 'Complex conversions and perimeter of irregular shapes'
            },
            parameters: { maxNumber: { default: 500 } },
        },

        'weight-mass': {
            id: 'weight-mass',
            name: 'Weight & Mass',
            description: 'Measuring weight/mass using pounds, ounces, grams, kilograms',
            strand: 'E',
            grades: gradeRange(1, 8),
            difficulty: {
                easy: 'Comparing weights (heavier/lighter)',
                medium: 'Measuring and converting (ounces to pounds, grams to kilograms)',
                hard: 'Multi-step conversion problems'
            },
            parameters: { maxNumber: { default: 500 } },
        },

        'capacity-volume': {
            id: 'capacity-volume',
            name: 'Capacity & Volume',
            description: 'Measuring liquid volume and capacity',
            strand: 'E',
            grades: gradeRange(1, 8),
            difficulty: {
                easy: 'Cups, pints, quarts, gallons concepts',
                medium: 'Converting between units (cups to quarts, liters to milliliters)',
                hard: 'Complex volume problems with multiple conversions'
            },
            parameters: { maxNumber: { default: 500 } },
        },

        'time': {
            id: 'time',
            name: 'Time & Elapsed Time',
            description: 'Telling time, reading clocks, calculating elapsed time',
            strand: 'E',
            grades: gradeRange(1, 8),
            difficulty: {
                easy: 'Telling time to hour and half-hour',
                medium: 'Telling time to 5 minutes and calculating simple elapsed time',
                hard: 'Complex elapsed time across days, weeks, and time zones'
            },
            parameters: { maxNumber: { default: 60 } },
        },

        'temperature': {
            id: 'temperature',
            name: 'Temperature',
            description: 'Reading thermometers and understanding temperature scales',
            strand: 'E',
            grades: gradeRange(3, 9),
            difficulty: {
                easy: 'Reading thermometer in Fahrenheit or Celsius',
                medium: 'Comparing temperatures and understanding freezing/boiling points',
                hard: 'Converting between Fahrenheit and Celsius'
            },
            parameters: { allowNegatives: { default: true }, maxNumber: { default: 40 } },
        },

        'money': {
            id: 'money',
            name: 'Money & Currency',
            description: 'Counting money, making change, and financial calculations',
            strand: 'F',
            grades: gradeRange(1, 9),
            difficulty: {
                easy: 'Identifying coins and bills, counting small amounts',
                medium: 'Making change and adding/subtracting money amounts',
                hard: 'Multi-step money problems with tax, discount, and tips'
            },
            parameters: { maxNumber: { default: 100 }, decimalPlaces: { default: 2, max: 2 } },
        },

        'metric-customary': {
            id: 'metric-customary',
            name: 'Metric & Customary Systems',
            description: 'Understanding and converting between measurement systems',
            strand: 'E',
            grades: gradeRange(3, 10),
            difficulty: {
                easy: 'Basic metric units (meter, liter, gram)',
                medium: 'Converting within metric system (km to m, L to mL)',
                hard: 'Converting between metric and customary systems'
            },
            parameters: { maxNumber: { default: 1000 } },
        },

        'unit-conversions': {
            id: 'unit-conversions',
            name: 'Unit Conversions',
            description: 'Converting between different units of measurement',
            strand: 'E',
            grades: gradeRange(4, 12),
            difficulty: {
                easy: 'Simple conversions (feet to inches, hours to minutes)',
                medium: 'Multi-step conversions (yards to feet to inches)',
                hard: 'Complex unit conversions with rates and ratios'
            },
            parameters: { maxNumber: { default: 1000 }, requireIntegerAnswers: true },
        },
    }
};
