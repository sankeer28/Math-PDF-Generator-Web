/**
 * Financial literacy problems
 *
 * One draw list per topic of the Financial Literacy subject. Each draw takes
 * the topic's resolved parameters, so the same template covers a Grade 4
 * allowance and a Grade 11 investment simply by changing the ceiling.
 *
 * @module curriculum/templates/financialProblems
 */

import { randomChoice } from '../../modules/utils.js';
import { getRandomItem, names, items, places } from '../config/contextualData.js';

/** Random integer in [min, max]. */
const between = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * A draw bounded by the topic's ceiling.
 *
 * Templates have a natural floor - a budget of $3 is not a budget - but the
 * ceiling a teacher sets must still win, so the floor gives way rather than
 * overriding it.
 */
const upTo = (ceiling, preferredFloor) => {
    const high = Math.max(2, Math.floor(ceiling));
    const low = Math.max(1, Math.min(preferredFloor, Math.floor(high / 2)));
    return between(low, high);
};

/** A price with cents, as a string, e.g. "12.45". */
const price = (min, max) => (between(min * 100, max * 100) / 100).toFixed(2);

const money = (value) => `$${Number(value).toFixed(2)}`;

const anyItem = () => randomChoice(items[randomChoice(Object.keys(items))]);

/**
 * @typedef {(p: Record<string, number|boolean|string>) => {question: string, answer: string}} FinancialTemplate
 */

/** @type {Record<string, FinancialTemplate[]>} */
export const FINANCIAL_PROBLEMS = {
    'coins-and-bills': [
        (p) => {
            const quarters = between(1, 6);
            const dimes = between(1, 8);
            const nickels = between(1, 6);
            const total = quarters * 25 + dimes * 10 + nickels * 5;
            return {
                question: `${getRandomItem(names)} has ${quarters} quarters, ${dimes} dimes and ${nickels} nickels. How much money is that in total?`,
                answer: money(total / 100),
            };
        },
        (p) => {
            const target = between(3, Math.max(4, Math.floor(p.maxNumber / 25))) * 25;
            return {
                question: `What is the smallest number of quarters that makes ${money(target / 100)}?`,
                answer: `${target / 25} quarters`,
            };
        },
        (p) => {
            const loonies = between(1, 5);
            const toonies = between(1, 4);
            return {
                question: `${getRandomItem(names)} has ${toonies} toonies and ${loonies} loonies. How much money do they have?`,
                answer: money(toonies * 2 + loonies),
            };
        },
    ],

    'making-change': [
        (p) => {
            const paid = upTo(p.maxNumber, 5);
            const cost = price(1, paid - 1);
            return {
                question: `${getRandomItem(names)} buys ${anyItem()} for ${money(cost)} and pays with ${money(paid)}. How much change should they receive?`,
                answer: money(paid - Number(cost)),
            };
        },
        (p) => {
            const one = Number(price(1, Math.max(2, p.maxNumber / 4)));
            const two = Number(price(1, Math.max(2, p.maxNumber / 4)));
            const paid = Math.ceil(one + two) + between(1, 5);
            return {
                question: `At the ${getRandomItem(places)}, ${getRandomItem(names)} buys ${anyItem()} for ${money(one)} and ${anyItem()} for ${money(two)}. They pay with ${money(paid)}. What is their change?`,
                answer: money(paid - one - two),
            };
        },
    ],

    budgeting: [
        (p) => {
            const income = upTo(p.maxNumber, 20);
            const spent = between(5, income - 5);
            return {
                question: `${getRandomItem(names)} earns ${money(income)} and spends ${money(spent)}. How much is left to save?`,
                answer: money(income - spent),
            };
        },
        (p) => {
            const income = upTo(p.maxNumber, 500);
            const rent = Math.round(income * 0.4);
            const food = Math.round(income * 0.2);
            const transport = Math.round(income * 0.1);
            return {
                question: `A monthly budget has income of ${money(income)}, with ${money(rent)} for rent, ${money(food)} for food and ${money(transport)} for transport. How much is left over?`,
                answer: money(income - rent - food - transport),
            };
        },
        (p) => {
            const goal = upTo(p.maxNumber, 100);
            const weekly = between(5, 40);
            return {
                question: `${getRandomItem(names)} wants to save ${money(goal)} and puts aside ${money(weekly)} each week. How many full weeks until they reach the goal?`,
                answer: `${Math.ceil(goal / weekly)} weeks`,
            };
        },
    ],

    'unit-price': [
        (p) => {
            const count = between(3, 12);
            const total = Number(price(2, Math.max(3, p.maxNumber)));
            return {
                question: `A pack of ${count} ${anyItem()} costs ${money(total)}. What is the price per item?`,
                answer: money(total / count),
            };
        },
        (p) => {
            const smallCount = between(2, 6);
            const largeCount = smallCount * between(2, 3);
            const smallPrice = Number(price(2, Math.max(3, p.maxNumber / 2)));
            const largePrice = Number((smallPrice * (largeCount / smallCount) * 0.85).toFixed(2));
            return {
                question: `${smallCount} ${anyItem()} cost ${money(smallPrice)}, and ${largeCount} of the same item cost ${money(largePrice)}. Which is the better value per item?`,
                answer: `the pack of ${largeCount}, at ${money(largePrice / largeCount)} each`,
            };
        },
    ],

    'sales-tax-discount': [
        (p) => {
            const cost = Number(price(2, Math.max(4, p.maxNumber)));
            const rate = randomChoice([5, 8, 13, 15]);
            return {
                question: `${anyItem()} costs ${money(cost)} before tax. With ${rate}% sales tax, what is the total price?`,
                answer: money(cost * (1 + rate / 100)),
            };
        },
        (p) => {
            const cost = Number(price(2, Math.max(4, p.maxNumber)));
            const discount = randomChoice([10, 15, 20, 25, 30, 40, 50]);
            return {
                question: `${anyItem()} is marked ${money(cost)} and is on sale at ${discount}% off. What is the sale price?`,
                answer: money(cost * (1 - discount / 100)),
            };
        },
        (p) => {
            const cost = Number(price(2, Math.max(4, p.maxNumber)));
            const discount = randomChoice([10, 20, 25]);
            const tax = 13;
            const final = cost * (1 - discount / 100) * (1 + tax / 100);
            return {
                question: `${anyItem()} costs ${money(cost)}. It is discounted ${discount}%, then ${tax}% tax is added. What is the final price?`,
                answer: money(final),
            };
        },
    ],

    'simple-interest': [
        (p) => {
            const principal = upTo(p.maxNumber, 100);
            const rate = between(2, 9);
            const years = between(1, 6);
            return {
                question: `${money(principal)} is invested at ${rate}% simple interest per year for ${years} years. How much interest is earned?`,
                answer: money((principal * rate * years) / 100),
            };
        },
        (p) => {
            const principal = upTo(p.maxNumber, 100);
            const rate = between(2, 9);
            const years = between(1, 5);
            return {
                question: `A loan of ${money(principal)} is charged ${rate}% simple interest per year. What is the total owed after ${years} years?`,
                answer: money(principal + (principal * rate * years) / 100),
            };
        },
        (p) => {
            const principal = upTo(p.maxNumber, 100);
            const rate = between(2, 9);
            const interest = (principal * rate) / 100;
            return {
                question: `An investment of ${money(principal)} earns ${money(interest)} in simple interest in one year. What is the annual interest rate?`,
                answer: `${rate}%`,
            };
        },
    ],

    'compound-interest': [
        (p) => {
            const principal = upTo(p.maxNumber, 500);
            const rate = between(2, 8);
            const years = between(2, 10);
            return {
                question: `${money(principal)} is invested at ${rate}% compounded annually for ${years} years. What is it worth at the end?`,
                answer: money(principal * (1 + rate / 100) ** years),
            };
        },
        (p) => {
            const principal = upTo(p.maxNumber, 500);
            const rate = between(2, 8);
            const years = between(2, 8);
            const value = principal * (1 + rate / 100) ** years;
            return {
                question: `${money(principal)} grows to ${money(value)} after ${years} years of annual compounding. How much interest was earned in total?`,
                answer: money(value - principal),
            };
        },
    ],

    'currency-exchange': [
        (p) => {
            const amount = upTo(p.maxNumber, 20);
            const rate = Number((Math.random() * 0.6 + 0.7).toFixed(2));
            return {
                question: `The exchange rate is 1 CAD to ${rate} USD. How many US dollars would ${amount} Canadian dollars buy?`,
                answer: `${(amount * rate).toFixed(2)} USD`,
            };
        },
        (p) => {
            const amount = upTo(p.maxNumber, 20);
            const rate = Number((Math.random() * 0.6 + 0.7).toFixed(2));
            return {
                question: `The exchange rate is 1 CAD to ${rate} USD. How many Canadian dollars are needed to buy ${amount} US dollars?`,
                answer: `${(amount / rate).toFixed(2)} CAD`,
            };
        },
    ],
};
