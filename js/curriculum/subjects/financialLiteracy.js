/**
 * Financial Literacy
 *
 * Ontario strand F, which runs from Grade 1 to Grade 12 and had no counterpart
 * in this app: money questions previously lived inside Measurement, and nothing
 * covered budgeting, unit price, interest or currency.
 *
 * @module curriculum/subjects/financialLiteracy
 */

import { gradeRange } from '../config/grades.js';

export const financialLiteracy = {
    id: 'financialLiteracy',
    name: 'Financial Literacy',
    description: 'Money, budgeting, unit price, interest and financial decisions',
    icon: 'coins',
    strand: 'F',

    topics: {
        'coins-and-bills': {
            id: 'coins-and-bills',
            name: 'Coins & Bills',
            description: 'Naming coins and bills and making up an amount',
            strand: 'F',
            grades: gradeRange(1, 4),
            difficulty: {
                easy: 'Counting a handful of coins',
                medium: 'Making an amount several ways',
                hard: 'Making an amount with the fewest coins',
            },
            parameters: {
                maxNumber: { label: 'Largest amount (cents)', default: 200, min: 10, max: 10000, step: 5 },
            },
        },

        'making-change': {
            id: 'making-change',
            name: 'Making Change',
            description: 'Working out the change owed from a purchase',
            strand: 'F',
            grades: gradeRange(2, 8),
            difficulty: {
                easy: 'Change from a whole dollar',
                medium: 'Change from a bill for several items',
                hard: 'Change with tax included',
            },
            parameters: {
                maxNumber: { label: 'Largest amount (dollars)', default: 50, min: 5, max: 500 },
                decimalPlaces: { default: 2, max: 2 },
            },
        },

        'budgeting': {
            id: 'budgeting',
            name: 'Budgeting',
            description: 'Planning spending against income and comparing choices',
            strand: 'F',
            grades: gradeRange(4, 12),
            difficulty: {
                easy: 'Adding up expenses against an allowance',
                medium: 'Balancing a monthly budget',
                hard: 'Adjusting a budget to reach a savings goal',
            },
            parameters: {
                maxNumber: { label: 'Largest amount (dollars)', default: 2000, min: 50, max: 100000 },
            },
        },

        'unit-price': {
            id: 'unit-price',
            name: 'Unit Price & Best Buy',
            description: 'Comparing prices per unit to find the better value',
            strand: 'F',
            grades: gradeRange(5, 12),
            difficulty: {
                easy: 'Price per item from a pack',
                medium: 'Comparing two package sizes',
                hard: 'Comparing across units with a discount applied',
            },
            parameters: {
                maxNumber: { label: 'Largest price (dollars)', default: 50, min: 5, max: 500 },
                decimalPlaces: { default: 2, max: 2 },
            },
        },

        'sales-tax-discount': {
            id: 'sales-tax-discount',
            name: 'Sales Tax & Discounts',
            description: 'Applying tax, discounts and tips to a price',
            strand: 'F',
            grades: gradeRange(6, 12),
            difficulty: {
                easy: 'A single percentage discount',
                medium: 'Discount then tax',
                hard: 'Working back from a final price',
            },
            parameters: {
                maxNumber: { label: 'Largest price (dollars)', default: 200, min: 10, max: 5000 },
                decimalPlaces: { default: 2, max: 2 },
            },
        },

        'simple-interest': {
            id: 'simple-interest',
            name: 'Simple Interest',
            description: 'Interest earned or owed at a flat rate',
            strand: 'F',
            grades: gradeRange(7, 12),
            difficulty: {
                easy: 'Interest for one year',
                medium: 'Interest over several years',
                hard: 'Finding the rate or the principal',
            },
            parameters: {
                maxNumber: { label: 'Largest principal (dollars)', default: 5000, min: 100, max: 100000 },
            },
        },

        'compound-interest': {
            id: 'compound-interest',
            name: 'Compound Interest',
            description: 'Growth of savings and the cost of borrowing over time',
            strand: 'F',
            grades: gradeRange(9, 12),
            difficulty: {
                easy: 'Compounding annually for a few years',
                medium: 'Different compounding periods',
                hard: 'Comparing loan or investment options',
            },
            parameters: {
                maxNumber: { label: 'Largest principal (dollars)', default: 10000, min: 100, max: 1000000 },
                decimalPlaces: { default: 2, max: 2 },
            },
        },

        'currency-exchange': {
            id: 'currency-exchange',
            name: 'Currency Exchange',
            description: 'Converting between currencies at a given rate',
            strand: 'F',
            grades: gradeRange(7, 12),
            difficulty: {
                easy: 'Converting one way at a simple rate',
                medium: 'Converting both ways',
                hard: 'Comparing costs across currencies with a fee',
            },
            parameters: {
                maxNumber: { label: 'Largest amount', default: 1000, min: 10, max: 100000 },
                decimalPlaces: { default: 2, max: 2 },
            },
        },
    },
};
