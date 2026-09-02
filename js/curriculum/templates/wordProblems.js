/**
 * Word problem templates
 *
 * Each template turns the shared contextual data (names, places, items) plus the
 * grade's number ceiling into one question and its answer. They live here as
 * data rather than as eighty near-identical methods on the generator: adding a
 * scenario is a new entry in a list, not a new method and a new dispatch line.
 *
 * @module curriculum/templates/wordProblems
 */

import { randomChoice } from '../../modules/utils.js';

/**
 * @typedef {(contexts: object, config: {maxNumber: number}) => {question: string, answer: number}} WordProblemTemplate
 */

/** @type {Record<string, WordProblemTemplate[]>} */
export const WORD_PROBLEM_TEMPLATES = {
    addition: [
    // addition 1
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.addition);
            const maxNum = Math.min(config.maxNumber, 500);

            const num1 = Math.floor(Math.random() * maxNum) + 10;
            const num2 = Math.floor(Math.random() * maxNum) + 5;

            return {
                question: `${name} had ${num1} ${items} in their collection. Last week, they ${action} ${num2} more ${items}. How many ${items} does ${name} have now?`,
                answer: num1 + num2
            };
    },
    // addition 2
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 300);

            const num1 = Math.floor(Math.random() * maxNum) + 15;
            const num2 = Math.floor(Math.random() * maxNum) + 8;

            return {
                question: `At the ${place}, ${name} counted ${num1} ${items} in the morning. By afternoon, ${num2} more ${items} had arrived. What is the total number of ${items} now?`,
                answer: num1 + num2
            };
    },
    // addition 3
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 400);

            const num1 = Math.floor(Math.random() * maxNum) + 12;
            const num2 = Math.floor(Math.random() * maxNum) + 8;

            return {
                question: `${names[0]} has ${num1} ${items} and ${names[1]} has ${num2} ${items}. If they combine their ${items} together, how many will they have in total?`,
                answer: num1 + num2
            };
    },
    // addition 4
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const timeframe = randomChoice(contexts.timeframes);
            const maxNum = Math.min(config.maxNumber, 200);

            const num1 = Math.floor(Math.random() * maxNum) + 8;
            const num2 = Math.floor(Math.random() * maxNum) + 6;

            return {
                question: `${name} is a ${profession} who creates ${num1} ${items} ${timeframe}. This week, they made an extra ${num2} ${items} for a special project. How many ${items} did they create this week in total?`,
                answer: num1 + num2
            };
    },
    // addition 5
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const measurement = randomChoice(contexts.measurements);
            const maxNum = Math.min(config.maxNumber, 150);

            const num1 = Math.floor(Math.random() * maxNum) + 20;
            const num2 = Math.floor(Math.random() * maxNum) + 15;

            return {
                question: `${name} weighed their collection of ${items} and found it was ${num1} ${measurement}. After adding more ${items}, the collection now weighs ${num1 + num2} ${measurement}. How many ${measurement} of ${items} did ${name} add?`,
                answer: num2
            };
    },
    // addition 6
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place1 = randomChoice(contexts.places);
            const place2 = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 250);

            const num1 = Math.floor(Math.random() * maxNum) + 18;
            const num2 = Math.floor(Math.random() * maxNum) + 12;

            return {
                question: `${name} visited two locations today. At the ${place1}, they saw ${num1} ${items}. At the ${place2}, they counted ${num2} ${items}. How many ${items} did ${name} see in total during their visits?`,
                answer: num1 + num2
            };
    },
    // addition 7
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.addition);
            const maxNum = Math.min(config.maxNumber, 180);

            const num1 = Math.floor(Math.random() * maxNum) + 25;
            const num2 = Math.floor(Math.random() * maxNum) + 18;
            const num3 = Math.floor(Math.random() * maxNum) + 10;

            return {
                question: `${name} started the month with ${num1} ${items}. In the first week, they ${action} ${num2} more. In the second week, they got ${num3} additional ${items}. How many ${items} does ${name} have now?`,
                answer: num1 + num2 + num3
            };
    },
    // addition 8
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const profession = randomChoice(contexts.professions);
            const maxNum = Math.min(config.maxNumber, 120);

            const num1 = Math.floor(Math.random() * maxNum) + 30;
            const num2 = Math.floor(Math.random() * maxNum) + 20;

            return {
                question: `${name}, who works as a ${profession}, needs ${items} for a project. They already have ${num1} ${items} and their colleague brought ${num2} more. What is the total number of ${items} available for the project?`,
                answer: num1 + num2
            };
    },
    // addition 9
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const event = randomChoice(contexts.events);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 200);

            const num1 = Math.floor(Math.random() * maxNum) + 15;
            const num2 = Math.floor(Math.random() * maxNum) + 12;

            return {
                question: `${name} is organizing a ${event}. They brought ${num1} ${items} and received ${num2} more ${items} as donations. How many ${items} are available for the event?`,
                answer: num1 + num2
            };
    },
    // addition 10
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const season = randomChoice(contexts.seasons);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const activity = randomChoice(contexts.activities);
            const maxNum = Math.min(config.maxNumber, 180);

            const num1 = Math.floor(Math.random() * maxNum) + 20;
            const num2 = Math.floor(Math.random() * maxNum) + 14;

            return {
                question: `During ${season}, ${name} spent time ${activity} ${items}. On Monday they found ${num1} ${items}, and on Tuesday they found ${num2} more. How many ${items} did ${name} find in total?`,
                answer: num1 + num2
            };
    },
    // addition 11
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 150);

            const num1 = Math.floor(Math.random() * maxNum) + 8;
            const num2 = Math.floor(Math.random() * maxNum) + 10;
            const num3 = Math.floor(Math.random() * maxNum) + 6;

            return {
                question: `Three friends are combining their collections. ${names[0]} has ${num1} ${items}, ${names[1]} has ${num2} ${items}, and ${names[2]} has ${num3} ${items}. What is the total number of ${items} when combined?`,
                answer: num1 + num2 + num3
            };
    },
    // addition 12
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const timeframe = randomChoice(contexts.timeframes);
            const maxNum = Math.min(config.maxNumber, 140);

            const num1 = Math.floor(Math.random() * maxNum) + 25;
            const num2 = Math.floor(Math.random() * maxNum) + 18;

            return {
                question: `The ${place} receives deliveries ${timeframe}. Last delivery had ${num1} ${items} and today's delivery has ${num2} ${items}. How many ${items} were delivered in these two shipments?`,
                answer: num1 + num2
            };
    },
    // addition 13
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const event = randomChoice(contexts.events);
            const maxNum = Math.min(config.maxNumber, 300);

            const num1 = Math.floor(Math.random() * maxNum) + 40;
            const num2 = Math.floor(Math.random() * maxNum) + 35;
            const num3 = Math.floor(Math.random() * maxNum) + 28;

            return {
                question: `For the ${event}, ${name} collected ${num1} ${items} on Friday, ${num2} ${items} on Saturday, and ${num3} ${items} on Sunday. What is the total number of ${items} collected over the three days?`,
                answer: num1 + num2 + num3
            };
    },
    // addition 14
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory1 = randomChoice(Object.keys(contexts.items));
            const itemCategory2 = randomChoice(Object.keys(contexts.items));
            const items1 = randomChoice(contexts.items[itemCategory1]);
            const items2 = randomChoice(contexts.items[itemCategory2]);
            const maxNum = Math.min(config.maxNumber, 160);

            const num1 = Math.floor(Math.random() * maxNum) + 22;
            const num2 = Math.floor(Math.random() * maxNum) + 19;

            return {
                question: `${names[0]} collected ${num1} ${items1} and ${names[1]} collected ${num2} ${items2}. If they count all items together, how many items do they have in total?`,
                answer: num1 + num2
            };
    },
    // addition 15
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const place = randomChoice(contexts.places);
            const maxNum = Math.min(config.maxNumber, 220);

            const num1 = Math.floor(Math.random() * maxNum) + 45;
            const num2 = Math.floor(Math.random() * maxNum) + 32;

            return {
                question: `${name}, a ${profession}, ordered supplies for the ${place}. The first shipment contained ${num1} ${items} and the second shipment had ${num2} ${items}. How many ${items} arrived in total?`,
                answer: num1 + num2
            };
    },
    // addition 16
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const activity = randomChoice(contexts.activities);
            const maxNum = Math.min(config.maxNumber, 190);

            const num1 = Math.floor(Math.random() * maxNum) + 28;
            const num2 = Math.floor(Math.random() * maxNum) + 24;
            const num3 = Math.floor(Math.random() * maxNum) + 16;
            const num4 = Math.floor(Math.random() * maxNum) + 12;

            return {
                question: `While ${activity} ${items}, ${name} found ${num1} in the morning, ${num2} at noon, ${num3} in the afternoon, and ${num4} in the evening. What is the total number of ${items} found?`,
                answer: num1 + num2 + num3 + num4
            };
    },
    // addition 17
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const season = randomChoice(contexts.seasons);
            const maxNum = Math.min(config.maxNumber, 170);

            const num1 = Math.floor(Math.random() * maxNum) + 35;
            const num2 = Math.floor(Math.random() * maxNum) + 26;

            return {
                question: `At the ${place} during ${season}, ${name} counted ${num1} ${items} on display. Later, staff members added ${num2} more ${items} to the display. How many ${items} are on display now?`,
                answer: num1 + num2
            };
    },
    // addition 18
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const event = randomChoice(contexts.events);
            const maxNum = Math.min(config.maxNumber, 240);

            const num1 = Math.floor(Math.random() * maxNum) + 50;
            const num2 = Math.floor(Math.random() * maxNum) + 42;

            return {
                question: `${names[0]} and ${names[1]} are preparing for a ${event}. ${names[0]} prepared ${num1} ${items} yesterday and ${names[1]} prepared ${num2} ${items} today. How many ${items} have been prepared so far?`,
                answer: num1 + num2
            };
    },
    // addition 19
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.addition);
            const timeframe = randomChoice(contexts.timeframes);
            const maxNum = Math.min(config.maxNumber, 130);

            const num1 = Math.floor(Math.random() * maxNum) + 18;
            const num2 = Math.floor(Math.random() * maxNum) + 22;
            const num3 = Math.floor(Math.random() * maxNum) + 15;

            return {
                question: `${name} ${action} ${items} ${timeframe}. In week one, they got ${num1} ${items}. In week two, they got ${num2} ${items}. In week three, they got ${num3} ${items}. What is the total for all three weeks?`,
                answer: num1 + num2 + num3
            };
    },
    // addition 20
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 210);

            const num1 = Math.floor(Math.random() * maxNum) + 38;
            const num2 = Math.floor(Math.random() * maxNum) + 30;
            const num3 = Math.floor(Math.random() * maxNum) + 25;

            return {
                question: `${name} works as a ${profession} at the ${place}. On Monday they processed ${num1} ${items}, on Wednesday they processed ${num2} ${items}, and on Friday they processed ${num3} ${items}. How many ${items} did they process in total?`,
                answer: num1 + num2 + num3
            };
    },
    ],

    subtraction: [
    // subtraction 1
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.subtraction);
            const maxNum = Math.min(config.maxNumber, 500);

            const num1 = Math.floor(Math.random() * maxNum) + 50;
            const num2 = Math.floor(Math.random() * (num1 - 10)) + 5;

            return {
                question: `${name} had a collection of ${num1} ${items}. During spring cleaning, they ${action} ${num2} of them. How many ${items} does ${name} have left?`,
                answer: num1 - num2
            };
    },
    // subtraction 2
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.subtraction);
            const maxNum = Math.min(config.maxNumber, 400);

            const num1 = Math.floor(Math.random() * maxNum) + 40;
            const num2 = Math.floor(Math.random() * (num1 - 15)) + 8;

            return {
                question: `The ${place} started the day with ${num1} ${items} in stock. By closing time, customers had ${action} ${num2} ${items}. How many ${items} remained?`,
                answer: num1 - num2
            };
    },
    // subtraction 3
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 300);

            const num1 = Math.floor(Math.random() * maxNum) + 60;
            const num2 = Math.floor(Math.random() * (num1 - 20)) + 10;

            return {
                question: `${name}, a ${profession}, was managing ${num1} ${items} for a project. Due to budget cuts, they had to remove ${num2} ${items} from the project. How many ${items} are still part of the project?`,
                answer: num1 - num2
            };
    },
    // subtraction 4
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place1 = randomChoice(contexts.places);
            const place2 = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 250);

            const num1 = Math.floor(Math.random() * maxNum) + 80;
            const num2 = Math.floor(Math.random() * (num1 - 30)) + 15;

            return {
                question: `${name} moved ${num1} ${items} from the ${place1} to the ${place2}. However, ${num2} ${items} were damaged during transport and had to be discarded. How many ${items} successfully reached the ${place2}?`,
                answer: num1 - num2
            };
    },
    // subtraction 5
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 200);

            const num1 = Math.floor(Math.random() * maxNum) + 70;
            const num2 = Math.floor(Math.random() * (num1 - 25)) + 12;

            return {
                question: `${names[0]} and ${names[1]} were sharing ${num1} ${items}. ${names[0]} took ${num2} ${items} for their personal use. How many ${items} were left for ${names[1]}?`,
                answer: num1 - num2
            };
    },
    // subtraction 6
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const measurement = randomChoice(contexts.measurements);
            const maxNum = Math.min(config.maxNumber, 180);

            const total = Math.floor(Math.random() * maxNum) + 90;
            const used = Math.floor(Math.random() * (total - 35)) + 18;

            return {
                question: `${name} started with ${total} ${measurement} of ${items}. During the week, they used ${used} ${measurement} for various projects. How many ${measurement} of ${items} do they have remaining?`,
                answer: total - used
            };
    },
    // subtraction 7
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action1 = randomChoice(contexts.actions.subtraction);
            const action2 = randomChoice(contexts.actions.subtraction);
            const maxNum = Math.min(config.maxNumber, 150);

            const num1 = Math.floor(Math.random() * maxNum) + 100;
            const num2 = Math.floor(Math.random() * 40) + 20;
            const num3 = Math.floor(Math.random() * 30) + 15;

            return {
                question: `${name} began the month with ${num1} ${items}. In the first week, they ${action1} ${num2} ${items}. In the second week, they ${action2} ${num3} more ${items}. How many ${items} does ${name} have left?`,
                answer: num1 - num2 - num3
            };
    },
    // subtraction 8
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const timeframe = randomChoice(contexts.timeframes);
            const maxNum = Math.min(config.maxNumber, 220);

            const num1 = Math.floor(Math.random() * maxNum) + 65;
            const num2 = Math.floor(Math.random() * (num1 - 30)) + 20;

            return {
                question: `At the ${place}, ${name} was responsible for maintaining ${num1} ${items} ${timeframe}. Due to wear and tear, ${num2} ${items} needed to be replaced and removed. How many original ${items} are still in use?`,
                answer: num1 - num2
            };
    },
    // subtraction 9
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const event = randomChoice(contexts.events);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.subtraction);
            const maxNum = Math.min(config.maxNumber, 280);

            const num1 = Math.floor(Math.random() * maxNum) + 75;
            const num2 = Math.floor(Math.random() * (num1 - 25)) + 18;

            return {
                question: `${name} prepared ${num1} ${items} for the ${event}. After ${action} ${num2} ${items}, how many ${items} remained?`,
                answer: num1 - num2
            };
    },
    // subtraction 10
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const season = randomChoice(contexts.seasons);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const activity = randomChoice(contexts.activities);
            const maxNum = Math.min(config.maxNumber, 240);

            const num1 = Math.floor(Math.random() * maxNum) + 85;
            const num2 = Math.floor(Math.random() * (num1 - 35)) + 22;

            return {
                question: `During ${season}, ${name} was ${activity} ${num1} ${items}. They removed ${num2} ${items} that were no longer needed. How many ${items} are left?`,
                answer: num1 - num2
            };
    },
    // subtraction 11
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.subtraction);
            const maxNum = Math.min(config.maxNumber, 320);

            const num1 = Math.floor(Math.random() * maxNum) + 120;
            const num2 = Math.floor(Math.random() * (num1 - 45)) + 28;

            return {
                question: `${names[0]} and ${names[1]} had ${num1} ${items} together. ${names[0]} ${action} ${num2} ${items}. How many ${items} do they have now?`,
                answer: num1 - num2
            };
    },
    // subtraction 12
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 260);

            const num1 = Math.floor(Math.random() * maxNum) + 95;
            const num2 = Math.floor(Math.random() * (num1 - 40)) + 30;

            return {
                question: `${name}, a ${profession} at the ${place}, managed an inventory of ${num1} ${items}. After shipping out ${num2} ${items} to customers, how many ${items} remained in inventory?`,
                answer: num1 - num2
            };
    },
    // subtraction 13
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const event = randomChoice(contexts.events);
            const action1 = randomChoice(contexts.actions.subtraction);
            const action2 = randomChoice(contexts.actions.subtraction);
            const maxNum = Math.min(config.maxNumber, 350);

            const num1 = Math.floor(Math.random() * maxNum) + 140;
            const num2 = Math.floor(Math.random() * 45) + 25;
            const num3 = Math.floor(Math.random() * 35) + 20;

            return {
                question: `For the ${event}, ${name} started with ${num1} ${items}. They ${action1} ${num2} ${items} on the first day and ${action2} ${num3} ${items} on the second day. How many ${items} are left?`,
                answer: num1 - num2 - num3
            };
    },
    // subtraction 14
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const timeframe = randomChoice(contexts.timeframes);
            const maxNum = Math.min(config.maxNumber, 290);

            const num1 = Math.floor(Math.random() * maxNum) + 110;
            const num2 = Math.floor(Math.random() * (num1 - 50)) + 35;

            return {
                question: `The ${place} stocks ${num1} ${items} ${timeframe}. If ${num2} ${items} were sold today, how many ${items} remain in stock?`,
                answer: num1 - num2
            };
    },
    // subtraction 15
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 200);

            const num1 = Math.floor(Math.random() * maxNum) + 90;
            const num2 = Math.floor(Math.random() * 35) + 15;
            const num3 = Math.floor(Math.random() * 30) + 12;

            return {
                question: `${names[0]}, ${names[1]}, and ${names[2]} started with ${num1} ${items}. ${names[0]} took ${num2} ${items} and ${names[1]} took ${num3} ${items}. How many ${items} does ${names[2]} have left?`,
                answer: num1 - num2 - num3
            };
    },
    // subtraction 16
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const activity = randomChoice(contexts.activities);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.subtraction);
            const maxNum = Math.min(config.maxNumber, 270);

            const num1 = Math.floor(Math.random() * maxNum) + 105;
            const num2 = Math.floor(Math.random() * (num1 - 48)) + 32;

            return {
                question: `While ${activity} ${items}, ${name} had ${num1} ${items} total. They ${action} ${num2} ${items} during the process. How many ${items} remain?`,
                answer: num1 - num2
            };
    },
    // subtraction 17
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const event = randomChoice(contexts.events);
            const maxNum = Math.min(config.maxNumber, 310);

            const num1 = Math.floor(Math.random() * maxNum) + 125;
            const num2 = Math.floor(Math.random() * (num1 - 55)) + 38;

            return {
                question: `${name}, working as a ${profession}, allocated ${num1} ${items} for the ${event}. After using ${num2} ${items}, how many ${items} were left unused?`,
                answer: num1 - num2
            };
    },
    // subtraction 18
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place1 = randomChoice(contexts.places);
            const place2 = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(config.maxNumber, 340);

            const num1 = Math.floor(Math.random() * maxNum) + 135;
            const num2 = Math.floor(Math.random() * (num1 - 60)) + 42;

            return {
                question: `${name} transferred ${num1} ${items} from the ${place1} to the ${place2}. During inspection, ${num2} ${items} were found to be defective and discarded. How many ${items} remained?`,
                answer: num1 - num2
            };
    },
    // subtraction 19
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const season = randomChoice(contexts.seasons);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.subtraction);
            const maxNum = Math.min(config.maxNumber, 230);

            const num1 = Math.floor(Math.random() * maxNum) + 100;
            const num2 = Math.floor(Math.random() * 25) + 16;
            const num3 = Math.floor(Math.random() * 22) + 14;
            const num4 = Math.floor(Math.random() * 20) + 10;

            return {
                question: `During ${season}, ${name} collected ${num1} ${items}. In week 1 they ${action} ${num2} ${items}, in week 2 they removed ${num3} ${items}, and in week 3 they removed ${num4} ${items}. How many ${items} are left?`,
                answer: num1 - num2 - num3 - num4
            };
    },
    // subtraction 20
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const activity = randomChoice(contexts.activities);
            const maxNum = Math.min(config.maxNumber, 380);

            const num1 = Math.floor(Math.random() * maxNum) + 150;
            const num2 = Math.floor(Math.random() * (num1 - 70)) + 48;

            return {
                question: `At the ${place}, ${name} was ${activity} ${num1} ${items}. After completing the task, ${num2} ${items} had been processed. How many ${items} still need to be processed?`,
                answer: num1 - num2
            };
    },
    ],

    multiplication: [
    // multiplication 1
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 50);

            const groups = Math.floor(Math.random() * maxNum) + 3;
            const perGroup = Math.floor(Math.random() * maxNum) + 2;

            return {
                question: `${name} is organizing ${items} for an event. They create ${groups} equal groups, with ${perGroup} ${items} in each group. How many ${items} are there in total?`,
                answer: groups * perGroup
            };
    },
    // multiplication 2
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const timeframe = randomChoice(contexts.timeframes);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 40);

            const rate = Math.floor(Math.random() * maxNum) + 4;
            const time = Math.floor(Math.random() * maxNum) + 3;

            return {
                question: `${name} works as a ${profession} and produces ${rate} ${items} ${timeframe}. If they work for ${time} time periods, how many ${items} will they produce?`,
                answer: rate * time
            };
    },
    // multiplication 3
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 35);

            const rows = Math.floor(Math.random() * maxNum) + 4;
            const cols = Math.floor(Math.random() * maxNum) + 3;

            return {
                question: `At the ${place}, ${name} arranged ${items} in a rectangular pattern with ${rows} rows and ${cols} columns. How many ${items} are there in total?`,
                answer: rows * cols
            };
    },
    // multiplication 4
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const containers = ["boxes", "bags", "containers", "packages", "crates", "baskets"];
            const container = randomChoice(containers);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 45);

            const numContainers = Math.floor(Math.random() * maxNum) + 3;
            const itemsPerContainer = Math.floor(Math.random() * maxNum) + 2;

            return {
                question: `${name} packed ${items} into ${container}. Each ${container.slice(0, -1)} contains exactly ${itemsPerContainer} ${items}. If there are ${numContainers} ${container}, how many ${items} are there altogether?`,
                answer: numContainers * itemsPerContainer
            };
    },
    // multiplication 5
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 30);

            const person1Amount = Math.floor(Math.random() * maxNum) + 5;
            const multiplier = Math.floor(Math.random() * 8) + 2;

            return {
                question: `${names[0]} has ${person1Amount} ${items}. ${names[1]} has ${multiplier} times as many ${items} as ${names[0]}. How many ${items} does ${names[1]} have?`,
                answer: person1Amount * multiplier
            };
    },
    // multiplication 6
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const measurement = randomChoice(contexts.measurements);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 25);

            const length = Math.floor(Math.random() * maxNum) + 6;
            const width = Math.floor(Math.random() * maxNum) + 4;

            return {
                question: `${name} is creating a display area that measures ${length} ${measurement} by ${width} ${measurement}. If they place one ${items.slice(0, -1)} per square ${measurement}, how many ${items} will fit in the display?`,
                answer: length * width
            };
    },
    // multiplication 7
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 38);

            const floors = Math.floor(Math.random() * 6) + 3;
            const itemsPerFloor = Math.floor(Math.random() * maxNum) + 5;

            return {
                question: `The ${place} has ${floors} floors. ${name} counted ${itemsPerFloor} ${items} on each floor. What is the total number of ${items} in the entire ${place}?`,
                answer: floors * itemsPerFloor
            };
    },
    // multiplication 8
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const events = ["weeks", "months", "sessions", "classes", "meetings", "workshops"];
            const event = randomChoice(events);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 20);

            const perEvent = Math.floor(Math.random() * maxNum) + 7;
            const numEvents = Math.floor(Math.random() * 12) + 4;

            return {
                question: `${name} collects ${perEvent} ${items} during each ${event.slice(0, -1)}. Over the course of ${numEvents} ${event}, how many ${items} will ${name} collect in total?`,
                answer: perEvent * numEvents
            };
    },
    // multiplication 9
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const event = randomChoice(contexts.events);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 25);

            const perSet = Math.floor(Math.random() * maxNum) + 5;
            const numSets = Math.floor(Math.random() * 15) + 3;

            return {
                question: `For the ${event}, ${name} is preparing sets of ${items}. Each set contains ${perSet} ${items} and they need ${numSets} sets. How many ${items} are needed in total?`,
                answer: perSet * numSets
            };
    },
    // multiplication 10
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 22);

            const perDay = Math.floor(Math.random() * maxNum) + 6;
            const numDays = Math.floor(Math.random() * 10) + 5;

            return {
                question: `${name} works as a ${profession} at the ${place}. They process ${perDay} ${items} each day. How many ${items} will they process in ${numDays} days?`,
                answer: perDay * numDays
            };
    },
    // multiplication 11
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const activity = randomChoice(contexts.activities);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 18);

            const perPerson = Math.floor(Math.random() * maxNum) + 8;

            return {
                question: `${names[0]} and ${names[1]} are ${activity} ${items}. If each person handles ${perPerson} ${items}, how many ${items} are they handling together?`,
                answer: perPerson * 2
            };
    },
    // multiplication 12
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const season = randomChoice(contexts.seasons);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const timeframe = randomChoice(contexts.timeframes);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 20);

            const perTime = Math.floor(Math.random() * maxNum) + 4;
            const numTimes = Math.floor(Math.random() * 16) + 6;

            return {
                question: `During ${season}, ${name} collects ${perTime} ${items} ${timeframe}. Over ${numTimes} time periods, how many ${items} will ${name} have collected?`,
                answer: perTime * numTimes
            };
    },
    // multiplication 13
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 24);

            const perShelf = Math.floor(Math.random() * maxNum) + 10;
            const numShelves = Math.floor(Math.random() * 12) + 4;

            return {
                question: `At the ${place}, ${name} is organizing ${items}. Each shelf holds ${perShelf} ${items} and there are ${numShelves} shelves. What is the total capacity for ${items}?`,
                answer: perShelf * numShelves
            };
    },
    // multiplication 14
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.multiplication);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 19);

            const perBox = Math.floor(Math.random() * maxNum) + 7;
            const numBoxes = Math.floor(Math.random() * 14) + 5;

            return {
                question: `${name} is ${action} ${items}. Each box contains ${perBox} ${items}, and there are ${numBoxes} boxes. How many ${items} are there in all?`,
                answer: perBox * numBoxes
            };
    },
    // multiplication 15
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const event = randomChoice(contexts.events);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 17);

            const perPerson = Math.floor(Math.random() * maxNum) + 9;

            return {
                question: `Three people are contributing to the ${event}. ${names[0]}, ${names[1]}, and ${names[2]} each brought ${perPerson} ${items}. How many ${items} are there in total?`,
                answer: perPerson * 3
            };
    },
    // multiplication 16
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 26);

            const perBatch = Math.floor(Math.random() * maxNum) + 12;
            const numBatches = Math.floor(Math.random() * 8) + 3;

            return {
                question: `${name}, a ${profession}, produces ${items} in batches. Each batch contains ${perBatch} ${items}. If ${name} completes ${numBatches} batches, how many ${items} are produced?`,
                answer: perBatch * numBatches
            };
    },
    // multiplication 17
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const activity = randomChoice(contexts.activities);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 21);

            const perRow = Math.floor(Math.random() * maxNum) + 8;
            const numRows = Math.floor(Math.random() * 11) + 4;

            return {
                question: `At the ${place}, ${name} is ${activity} ${items} in rows. Each row has ${perRow} ${items}. With ${numRows} rows, how many ${items} are there in total?`,
                answer: perRow * numRows
            };
    },
    // multiplication 18
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const season = randomChoice(contexts.seasons);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 23);

            const perWeek = Math.floor(Math.random() * maxNum) + 11;
            const numWeeks = Math.floor(Math.random() * 9) + 4;

            return {
                question: `During ${season}, ${name} creates ${perWeek} ${items} per week. Over ${numWeeks} weeks, how many ${items} will ${name} create?`,
                answer: perWeek * numWeeks
            };
    },
    // multiplication 19
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const event = randomChoice(contexts.events);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const place = randomChoice(contexts.places);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 16);

            const perTable = Math.floor(Math.random() * maxNum) + 6;
            const numTables = Math.floor(Math.random() * 13) + 5;

            return {
                question: `For the ${event} at the ${place}, ${name} is setting up tables. Each table needs ${perTable} ${items}. With ${numTables} tables, how many ${items} are needed?`,
                answer: perTable * numTables
            };
    },
    // multiplication 20
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names), randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const activity = randomChoice(contexts.activities);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 15);

            const perPerson = Math.floor(Math.random() * maxNum) + 8;

            return {
                question: `Four people are ${activity} ${items}. ${names[0]}, ${names[1]}, ${names[2]}, and ${names[3]} each handle ${perPerson} ${items}. What is the total number of ${items}?`,
                answer: perPerson * 4
            };
    },
    ],

    division: [
    // division 1
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.division);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 30);

            const groups = Math.floor(Math.random() * maxNum) + 3;
            const perGroup = Math.floor(Math.random() * maxNum) + 2;
            const total = groups * perGroup;

            return {
                question: `${name} has ${total} ${items} that need to be ${action} ${groups} groups. How many ${items} will be in each group?`,
                answer: perGroup
            };
    },
    // division 2
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const people = ["friends", "students", "colleagues", "family members", "teammates", "participants"];
            const group = randomChoice(people);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 25);

            const numPeople = Math.floor(Math.random() * maxNum) + 4;
            const perPerson = Math.floor(Math.random() * maxNum) + 3;
            const total = numPeople * perPerson;

            return {
                question: `${name} wants to share ${total} ${items} equally among ${numPeople} ${group}. How many ${items} will each person receive?`,
                answer: perPerson
            };
    },
    // division 3
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const containers = ["boxes", "bags", "containers", "packages", "sets"];
            const container = randomChoice(containers);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 20);

            const perContainer = Math.floor(Math.random() * maxNum) + 5;
            const numContainers = Math.floor(Math.random() * maxNum) + 3;
            const total = perContainer * numContainers;

            return {
                question: `${name}, a ${profession}, has ${total} ${items} to pack into ${container}. If each ${container.slice(0, -1)} should contain the same number of ${items}, and there are ${numContainers} ${container}, how many ${items} go in each ${container.slice(0, -1)}?`,
                answer: perContainer
            };
    },
    // division 4
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const areas = ["sections", "departments", "zones", "areas", "wings", "rooms"];
            const area = randomChoice(areas);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 22);

            const numAreas = Math.floor(Math.random() * maxNum) + 4;
            const perArea = Math.floor(Math.random() * maxNum) + 6;
            const total = numAreas * perArea;

            return {
                question: `The ${place} has ${total} ${items} distributed across ${numAreas} different ${area}. If each ${area.slice(0, -1)} has an equal number of ${items}, how many ${items} are in each ${area.slice(0, -1)}?`,
                answer: perArea
            };
    },
    // division 5
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const timeframes = ["days", "weeks", "months", "sessions", "periods"];
            const timeframe = randomChoice(timeframes);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 18);

            const numPeriods = Math.floor(Math.random() * maxNum) + 5;
            const perPeriod = Math.floor(Math.random() * maxNum) + 4;
            const total = numPeriods * perPeriod;

            return {
                question: `${name} produced ${total} ${items} over ${numPeriods} ${timeframes}. If the production was consistent each ${timeframe.slice(0, -1)}, how many ${items} were produced per ${timeframe.slice(0, -1)}?`,
                answer: perPeriod
            };
    },
    // division 6
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const measurement = randomChoice(contexts.measurements);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 15);

            const length = Math.floor(Math.random() * maxNum) + 8;
            const segments = Math.floor(Math.random() * 8) + 3;
            const total = length * segments;

            return {
                question: `${name} has ${total} ${measurement} of ${items} to cut into ${segments} equal pieces. How many ${measurement} long will each piece be?`,
                answer: length
            };
    },
    // division 7
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 16);

            const perPerson = Math.floor(Math.random() * maxNum) + 7;
            const total = perPerson * 3;

            return {
                question: `${names[0]}, ${names[1]}, and ${names[2]} collected ${total} ${items} together. If they split the ${items} equally among themselves, how many ${items} will each person get?`,
                answer: perPerson
            };
    },
    // division 8
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const vehicles = ["trucks", "vans", "cars", "buses", "trailers"];
            const vehicle = randomChoice(vehicles);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 14);

            const numVehicles = Math.floor(Math.random() * maxNum) + 4;
            const perVehicle = Math.floor(Math.random() * maxNum) + 8;
            const total = numVehicles * perVehicle;

            return {
                question: `${name} needs to transport ${total} ${items} from the ${place} using ${numVehicles} ${vehicle}. If each ${vehicle.slice(0, -1)} carries the same amount, how many ${items} will be in each ${vehicle.slice(0, -1)}?`,
                answer: perVehicle
            };
    },
    // division 9
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const event = randomChoice(contexts.events);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.division);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 16);

            const numGroups = Math.floor(Math.random() * maxNum) + 5;
            const perGroup = Math.floor(Math.random() * maxNum) + 6;
            const total = numGroups * perGroup;

            return {
                question: `For the ${event}, ${name} needs to ${action} ${total} ${items} equally among ${numGroups} groups. How many ${items} will each group receive?`,
                answer: perGroup
            };
    },
    // division 10
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const place = randomChoice(contexts.places);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 18);

            const numDays = Math.floor(Math.random() * maxNum) + 4;
            const perDay = Math.floor(Math.random() * maxNum) + 7;
            const total = numDays * perDay;

            return {
                question: `${name}, a ${profession} at the ${place}, completed ${total} ${items} over ${numDays} days. If the same number was completed each day, how many ${items} were completed daily?`,
                answer: perDay
            };
    },
    // division 11
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const activity = randomChoice(contexts.activities);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 15);

            const numPeople = 2;
            const perPerson = Math.floor(Math.random() * maxNum) + 8;
            const total = numPeople * perPerson;

            return {
                question: `${names[0]} and ${names[1]} are ${activity} ${total} ${items}. If they share the ${items} equally, how many will each person get?`,
                answer: perPerson
            };
    },
    // division 12
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const season = randomChoice(contexts.seasons);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 17);

            const numWeeks = Math.floor(Math.random() * maxNum) + 6;
            const perWeek = Math.floor(Math.random() * maxNum) + 5;
            const total = numWeeks * perWeek;

            return {
                question: `During ${season}, ${name} collected ${total} ${items} over ${numWeeks} weeks. If they collected the same amount each week, how many ${items} were collected per week?`,
                answer: perWeek
            };
    },
    // division 13
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const action = randomChoice(contexts.actions.division);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 19);

            const numShelves = Math.floor(Math.random() * maxNum) + 6;
            const perShelf = Math.floor(Math.random() * maxNum) + 9;
            const total = numShelves * perShelf;

            return {
                question: `At the ${place}, ${name} needs to ${action} ${total} ${items} across ${numShelves} shelves. How many ${items} should go on each shelf?`,
                answer: perShelf
            };
    },
    // division 14
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const event = randomChoice(contexts.events);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 20);

            const numBoxes = Math.floor(Math.random() * maxNum) + 5;
            const perBox = Math.floor(Math.random() * maxNum) + 7;
            const total = numBoxes * perBox;

            return {
                question: `${name} is organizing ${items} for the ${event}. They have ${total} ${items} to pack into ${numBoxes} boxes equally. How many ${items} will each box contain?`,
                answer: perBox
            };
    },
    // division 15
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 13);

            const numPeople = 3;
            const perPerson = Math.floor(Math.random() * maxNum) + 8;
            const total = numPeople * perPerson;

            return {
                question: `${names[0]}, ${names[1]}, and ${names[2]} need to divide ${total} ${items} equally among themselves. How many ${items} will each person receive?`,
                answer: perPerson
            };
    },
    // division 16
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const profession = randomChoice(contexts.professions);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const activity = randomChoice(contexts.activities);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 21);

            const numBatches = Math.floor(Math.random() * maxNum) + 4;
            const perBatch = Math.floor(Math.random() * maxNum) + 10;
            const total = numBatches * perBatch;

            return {
                question: `${name}, a ${profession}, is ${activity} ${total} ${items}. If these are divided into ${numBatches} equal batches, how many ${items} are in each batch?`,
                answer: perBatch
            };
    },
    // division 17
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const timeframe = randomChoice(contexts.timeframes);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 22);

            const numPeriods = Math.floor(Math.random() * maxNum) + 7;
            const perPeriod = Math.floor(Math.random() * maxNum) + 6;
            const total = numPeriods * perPeriod;

            return {
                question: `The ${place} distributed ${total} ${items} ${timeframe} over ${numPeriods} time periods. How many ${items} were distributed per period?`,
                answer: perPeriod
            };
    },
    // division 18
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const season = randomChoice(contexts.seasons);
            const action = randomChoice(contexts.actions.division);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 23);

            const numContainers = Math.floor(Math.random() * maxNum) + 5;
            const perContainer = Math.floor(Math.random() * maxNum) + 8;
            const total = numContainers * perContainer;

            return {
                question: `During ${season}, ${name} needs to ${action} ${total} ${items} into ${numContainers} containers. How many ${items} should each container hold?`,
                answer: perContainer
            };
    },
    // division 19
    (contexts, config) => {
            const names = [randomChoice(contexts.names), randomChoice(contexts.names), randomChoice(contexts.names), randomChoice(contexts.names)];
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const event = randomChoice(contexts.events);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 12);

            const numPeople = 4;
            const perPerson = Math.floor(Math.random() * maxNum) + 9;
            const total = numPeople * perPerson;

            return {
                question: `At the ${event}, ${names[0]}, ${names[1]}, ${names[2]}, and ${names[3]} are sharing ${total} ${items} equally. How many ${items} does each person get?`,
                answer: perPerson
            };
    },
    // division 20
    (contexts, config) => {
            const name = randomChoice(contexts.names);
            const place = randomChoice(contexts.places);
            const itemCategory = randomChoice(Object.keys(contexts.items));
            const items = randomChoice(contexts.items[itemCategory]);
            const activity = randomChoice(contexts.activities);
            const maxNum = Math.min(Math.sqrt(config.maxNumber), 24);

            const numRows = Math.floor(Math.random() * maxNum) + 6;
            const perRow = Math.floor(Math.random() * maxNum) + 7;
            const total = numRows * perRow;

            return {
                question: `At the ${place}, ${name} is ${activity} ${total} ${items} in ${numRows} equal rows. How many ${items} will be in each row?`,
                answer: perRow
            };
    },
    ],
};
