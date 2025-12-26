/**
 * Contextual Data for Word Problem Generation
 * Names, places, items, and scenarios for creating realistic problems
 */

/**
 * Diverse, gender-neutral names for word problems
 */
export const names = [
    "Alex", "Bailey", "Carmen", "Devon", "Elena", "Felix", "Grace", "Hunter", "Isabella", "Jordan",
    "Kai", "Luna", "Marcus", "Nina", "Oliver", "Phoenix", "Quinn", "River", "Sage", "Taylor",
    "Uma", "Victor", "Willow", "Xander", "Yara", "Zoe", "Ava", "Blake", "Cora", "Dylan",
    "Emma", "Finn", "Gemma", "Hudson", "Ivy", "Jax", "Kira", "Leo", "Maya", "Noah",
    "Aria", "Beau", "Chloe", "Diego", "Eva", "Gage", "Hana", "Ian", "Jade", "Knox"
];

/**
 * Common professions for realistic scenarios
 */
export const professions = [
    "teacher", "chef", "artist", "scientist", "engineer", "doctor", "librarian", "farmer",
    "architect", "musician", "photographer", "designer", "pilot", "mechanic", "programmer",
    "baker", "nurse", "accountant", "writer", "coach", "veterinarian", "electrician"
];

/**
 * Places where scenarios can occur
 */
export const places = [
    "school", "library", "store", "park", "museum", "theater", "restaurant", "hospital",
    "factory", "office", "farm", "bakery", "workshop", "studio", "laboratory",
    "gym", "mall", "beach", "zoo", "aquarium", "concert hall", "gallery"
];

/**
 * Items organized by category for contextual word problems
 */
export const items = {
    school: [
        "pencils", "notebooks", "erasers", "rulers", "markers", "textbooks",
        "folders", "calculators", "crayons", "scissors", "glue sticks", "binders"
    ],

    food: [
        "apples", "cookies", "sandwiches", "pizzas", "cupcakes", "bagels",
        "muffins", "donuts", "bananas", "oranges", "grapes", "carrots"
    ],

    toys: [
        "action figures", "dolls", "puzzles", "board games", "building blocks",
        "toy cars", "stuffed animals", "marbles", "yo-yos", "kites", "balls", "jump ropes"
    ],

    technology: [
        "computers", "tablets", "phones", "cameras", "headphones", "speakers",
        "keyboards", "mice", "chargers", "batteries", "USB drives", "monitors"
    ],

    nature: [
        "flowers", "trees", "rocks", "shells", "leaves", "seeds",
        "butterflies", "birds", "acorns", "pinecones", "mushrooms", "feathers"
    ],

    sports: [
        "basketballs", "soccer balls", "tennis balls", "baseball cards", "helmets",
        "jerseys", "trophies", "medals", "water bottles", "tennis rackets", "baseballs", "footballs"
    ],

    art: [
        "paintbrushes", "canvases", "colored pencils", "sketchbooks", "sculptures",
        "paintings", "clay pots", "stickers", "origami paper", "craft supplies", "beads", "yarn"
    ],

    books: [
        "novels", "comics", "magazines", "encyclopedias", "poetry books",
        "cookbooks", "atlases", "dictionaries", "biographies", "textbooks", "graphic novels", "almanacs"
    ],

    clothing: [
        "shirts", "pants", "socks", "shoes", "hats", "jackets",
        "sweaters", "scarves", "gloves", "belts", "dresses", "sneakers"
    ],

    office: [
        "pens", "staplers", "paper clips", "folders", "envelopes", "stamps",
        "notepads", "calendars", "file cabinets", "chairs", "desks", "whiteboards"
    ]
};

/**
 * Action verbs organized by mathematical operation
 */
export const actions = {
    addition: [
        "bought", "found", "received", "collected", "gathered", "picked up",
        "earned", "won", "discovered", "inherited", "was given", "acquired",
        "obtained", "got as gifts", "harvested", "caught"
    ],

    subtraction: [
        "sold", "gave away", "lost", "used", "ate", "donated", "threw away",
        "broke", "returned", "lent", "traded", "exchanged", "consumed",
        "spent", "shipped", "delivered"
    ],

    multiplication: [
        "packed into boxes", "organized into groups", "arranged in rows",
        "sorted into sets", "divided among teams", "placed in containers",
        "distributed across", "allocated to", "bundled into", "grouped by"
    ],

    division: [
        "shared equally", "distributed evenly", "divided among", "split between",
        "separated into", "organized into", "arranged in", "grouped into",
        "partitioned among", "allocated to each"
    ]
};

/**
 * Time-related phrases for rate problems
 */
export const timeframes = [
    "daily", "weekly", "monthly", "per hour", "each day",
    "every week", "per session", "each time", "annually",
    "per minute", "hourly", "biweekly"
];

/**
 * Units of measurement for various problem types
 */
export const measurements = {
    weight: ["pounds", "kilograms", "ounces", "grams", "tons"],
    volume: ["liters", "gallons", "milliliters", "cups", "quarts"],
    length: ["meters", "feet", "inches", "centimeters", "kilometers", "miles", "yards"],
    area: ["square feet", "square meters", "acres", "square inches"],
    time: ["seconds", "minutes", "hours", "days", "weeks", "months", "years"]
};

/**
 * Get random item from array
 * @param {Array} arr - Array to select from
 * @returns {*} Random item
 */
export function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random items from a category
 * @param {string} category - Category name from items object
 * @param {number} count - Number of items to get
 * @returns {Array} Array of random items
 */
export function getRandomItems(category, count = 1) {
    const categoryItems = items[category] || items.school;
    const result = [];
    const available = [...categoryItems];

    for (let i = 0; i < count && available.length > 0; i++) {
        const index = Math.floor(Math.random() * available.length);
        result.push(available.splice(index, 1)[0]);
    }

    return result;
}
