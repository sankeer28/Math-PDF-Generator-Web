/**
 * Statistics & Probability Subject Configuration
 * Data analysis, probability, and statistical reasoning
 */

export const statistics = {
    id: 'statistics',
    name: 'Statistics & Probability',
    description: 'Data analysis, probability, and statistical methods',
    icon: 'chart-bar',

    // Topics organized by concept
    topics: {
        'picture-graphs': {
            id: 'picture-graphs',
            name: 'Picture Graphs & Tally Charts',
            description: 'Basic data representation for early learners',
            grades: ['elementary'],
            difficulty: {
                easy: 'Reading simple picture graphs (1 picture = 1 object)',
                medium: 'Creating tally charts and picture graphs',
                hard: 'Picture graphs with scales (1 picture = 5 objects)'
            }
        },

        'bar-graphs': {
            id: 'bar-graphs',
            name: 'Bar Graphs',
            description: 'Creating and reading bar graphs',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Reading simple bar graphs',
                medium: 'Creating bar graphs from data',
                hard: 'Double bar graphs and comparing data sets'
            }
        },

        'line-plots': {
            id: 'line-plots',
            name: 'Line Plots (Dot Plots)',
            description: 'Organizing data on a number line',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Reading simple line plots with whole numbers',
                medium: 'Creating line plots and finding mode',
                hard: 'Line plots with fractions and analyzing distributions'
            }
        },

        'graphs-charts': {
            id: 'graphs-charts',
            name: 'Advanced Graphs & Charts',
            description: 'Creating and interpreting complex data visualizations',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Reading pie charts and line graphs',
                medium: 'Creating histograms and frequency tables',
                hard: 'Box plots, stem-and-leaf plots, and scatter plots'
            }
        },

        'mean-median-mode': {
            id: 'mean-median-mode',
            name: 'Mean, Median, Mode',
            description: 'Measures of central tendency',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Finding mean of simple data sets',
                medium: 'Calculating all three measures',
                hard: 'Weighted averages and choosing appropriate measures'
            }
        },

        'probability': {
            id: 'probability',
            name: 'Basic Probability',
            description: 'Calculating likelihood of events',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Simple probability with coins and dice',
                medium: 'Compound probability and tree diagrams',
                hard: 'Conditional probability and combinations'
            }
        },

        'data-analysis': {
            id: 'data-analysis',
            name: 'Data Analysis',
            description: 'Analyzing and interpreting data sets',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Reading and organizing data',
                medium: 'Range, quartiles, and outliers',
                hard: 'Standard deviation and variance'
            }
        },

        'sampling': {
            id: 'sampling',
            name: 'Sampling & Surveys',
            description: 'Statistical sampling methods',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Understanding random sampling',
                medium: 'Identifying bias in samples',
                hard: 'Margin of error and confidence intervals'
            }
        },

        'correlation': {
            id: 'correlation',
            name: 'Correlation & Regression',
            description: 'Relationships between variables',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Identifying positive/negative correlation',
                medium: 'Scatter plots and line of best fit',
                hard: 'Linear regression and correlation coefficient'
            }
        },

        'counting-principles': {
            id: 'counting-principles',
            name: 'Counting Principles',
            description: 'Permutations, combinations, and fundamental counting principle',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Fundamental counting principle with 2-3 choices',
                medium: 'Simple permutations and combinations',
                hard: 'Complex problems with factorials, nPr, and nCr'
            }
        }
    }
};
