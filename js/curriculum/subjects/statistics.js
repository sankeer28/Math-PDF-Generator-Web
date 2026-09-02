/**
 * Statistics & Probability Subject Configuration
 * Data analysis, probability, and statistical reasoning
 */

import { gradeRange } from '../config/grades.js';

export const statistics = {
    id: 'statistics',
    name: 'Data & Probability',
    description: 'Collecting, displaying and interpreting data, and probability',
    icon: 'chart-bar',
    strand: 'D',

    // Topics organized by concept
    topics: {
        'picture-graphs': {
            id: 'picture-graphs',
            name: 'Picture Graphs & Tally Charts',
            description: 'Basic data representation for early learners',
            strand: 'D',
            grades: gradeRange(1, 4),
            difficulty: {
                easy: 'Reading simple picture graphs (1 picture = 1 object)',
                medium: 'Creating tally charts and picture graphs',
                hard: 'Picture graphs with scales (1 picture = 5 objects)'
            },
            parameters: { maxNumber: { default: 20 } },
        },

        'bar-graphs': {
            id: 'bar-graphs',
            name: 'Bar Graphs',
            description: 'Creating and reading bar graphs',
            strand: 'D',
            grades: gradeRange(1, 8),
            difficulty: {
                easy: 'Reading simple bar graphs',
                medium: 'Creating bar graphs from data',
                hard: 'Double bar graphs and comparing data sets'
            },
            parameters: { maxNumber: { default: 50 } },
        },

        'line-plots': {
            id: 'line-plots',
            name: 'Line Plots (Dot Plots)',
            description: 'Organizing data on a number line',
            strand: 'D',
            grades: gradeRange(2, 8),
            difficulty: {
                easy: 'Reading simple line plots with whole numbers',
                medium: 'Creating line plots and finding mode',
                hard: 'Line plots with fractions and analyzing distributions'
            },
            parameters: { maxNumber: { default: 30 } },
        },

        'graphs-charts': {
            id: 'graphs-charts',
            name: 'Advanced Graphs & Charts',
            description: 'Creating and interpreting complex data visualizations',
            strand: 'D',
            grades: gradeRange(4, 12),
            difficulty: {
                easy: 'Reading pie charts and line graphs',
                medium: 'Creating histograms and frequency tables',
                hard: 'Box plots, stem-and-leaf plots, and scatter plots'
            },
            parameters: { maxNumber: { default: 100 } },
        },

        'mean-median-mode': {
            id: 'mean-median-mode',
            name: 'Mean, Median, Mode',
            description: 'Measures of central tendency',
            strand: 'D',
            grades: gradeRange(4, 12),
            difficulty: {
                easy: 'Finding mean of simple data sets',
                medium: 'Calculating all three measures',
                hard: 'Weighted averages and choosing appropriate measures'
            },
            parameters: { maxNumber: { default: 100 }, terms: { label: 'Values in the data set', default: 5, min: 3, max: 10 } },
        },

        'probability': {
            id: 'probability',
            name: 'Basic Probability',
            description: 'Calculating likelihood of events',
            strand: 'D',
            grades: gradeRange(4, 12),
            difficulty: {
                easy: 'Simple probability with coins and dice',
                medium: 'Compound probability and tree diagrams',
                hard: 'Conditional probability and combinations'
            },
            parameters: { maxNumber: { default: 20 } },
        },

        'data-analysis': {
            id: 'data-analysis',
            name: 'Data Analysis',
            description: 'Analyzing and interpreting data sets',
            strand: 'D',
            grades: gradeRange(5, 12),
            difficulty: {
                easy: 'Reading and organizing data',
                medium: 'Range, quartiles, and outliers',
                hard: 'Standard deviation and variance'
            },
            parameters: { maxNumber: { default: 100 } },
        },

        'sampling': {
            id: 'sampling',
            name: 'Sampling & Surveys',
            description: 'Statistical sampling methods',
            strand: 'D',
            grades: gradeRange(7, 12),
            difficulty: {
                easy: 'Understanding random sampling',
                medium: 'Identifying bias in samples',
                hard: 'Margin of error and confidence intervals'
            },
            parameters: { maxNumber: { default: 500 } },
        },

        'correlation': {
            id: 'correlation',
            name: 'Correlation & Regression',
            description: 'Relationships between variables',
            strand: 'D',
            grades: gradeRange(9, 12),
            difficulty: {
                easy: 'Identifying positive/negative correlation',
                medium: 'Scatter plots and line of best fit',
                hard: 'Linear regression and correlation coefficient'
            },
            parameters: { maxNumber: { default: 100 } },
        },

        'counting-principles': {
            id: 'counting-principles',
            name: 'Counting Principles',
            description: 'Permutations, combinations, and fundamental counting principle',
            strand: 'D',
            grades: gradeRange(8, 12),
            difficulty: {
                easy: 'Fundamental counting principle with 2-3 choices',
                medium: 'Simple permutations and combinations',
                hard: 'Complex problems with factorials, nPr, and nCr'
            },
            parameters: { maxNumber: { default: 12 } },
        },
    }
};
