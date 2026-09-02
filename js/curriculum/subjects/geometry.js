/**
 * Geometry Subject Configuration
 * Shapes, measurements, spatial reasoning, and proofs
 */

import { gradeRange } from '../config/grades.js';

export const geometry = {
    id: 'geometry',
    name: 'Geometry & Spatial Sense',
    description: 'Shape, position, transformation and measurement of figures',
    icon: 'shapes',
    strand: 'E',

    // Topics organized by concept
    topics: {
        '2d-shapes': {
            id: '2d-shapes',
            name: '2D Shapes Recognition',
            description: 'Identifying and classifying basic 2D shapes',
            strand: 'E',
            grades: gradeRange(1, 8),
            difficulty: {
                easy: 'Identifying circles, squares, triangles, rectangles',
                medium: 'Classifying shapes by attributes (sides, vertices)',
                hard: 'Complex shape patterns and classification'
            },
            parameters: { maxNumber: { default: 20 } },
        },

        '3d-shapes': {
            id: '3d-shapes',
            name: '3D Shapes & Solids',
            description: 'Identifying 3D shapes, faces, edges, vertices',
            strand: 'E',
            grades: gradeRange(1, 9),
            difficulty: {
                easy: 'Identifying cubes, spheres, cones, cylinders',
                medium: 'Counting faces, edges, and vertices',
                hard: 'Nets of 3D shapes and spatial visualization'
            },
            parameters: { maxNumber: { default: 20 } },
        },

        'area-perimeter': {
            id: 'area-perimeter',
            name: 'Area & Perimeter',
            description: 'Calculating area and perimeter of 2D shapes',
            strand: 'E',
            grades: gradeRange(3, 10),
            difficulty: {
                easy: 'Rectangles and squares',
                medium: 'Triangles and circles',
                hard: 'Composite shapes and irregular polygons'
            },
            parameters: { maxNumber: { default: 50 }, requireIntegerAnswers: true },
        },

        'angles': {
            id: 'angles',
            name: 'Angles & Lines',
            description: 'Measuring and classifying angles',
            strand: 'E',
            grades: gradeRange(4, 11),
            difficulty: {
                easy: 'Identifying acute, right, obtuse angles',
                medium: 'Complementary and supplementary angles',
                hard: 'Angle relationships with parallel lines and transversals'
            },
            parameters: { maxNumber: { default: 180 } },
        },

        'triangles': {
            id: 'triangles',
            name: 'Triangles',
            description: 'Triangle properties, types, and theorems',
            strand: 'E',
            grades: gradeRange(5, 12),
            difficulty: {
                easy: 'Classifying triangles by sides and angles',
                medium: 'Pythagorean theorem',
                hard: 'Triangle congruence and similarity proofs'
            },
            parameters: { maxNumber: { default: 30 } },
        },

        'circles': {
            id: 'circles',
            name: 'Circles',
            description: 'Circle properties, circumference, and area',
            strand: 'E',
            grades: gradeRange(7, 12),
            difficulty: {
                easy: 'Finding circumference and area',
                medium: 'Arc length and sector area',
                hard: 'Circle theorems and tangent problems'
            },
            parameters: { maxNumber: { default: 25 }, decimalPlaces: { default: 2 } },
        },

        'polygons': {
            id: 'polygons',
            name: 'Polygons',
            description: 'Properties of polygons',
            strand: 'E',
            grades: gradeRange(3, 10),
            difficulty: {
                easy: 'Identifying and naming polygons',
                medium: 'Interior and exterior angles',
                hard: 'Regular polygons and tessellations'
            },
            parameters: { maxNumber: { default: 12 } },
        },

        'transformations': {
            id: 'transformations',
            name: 'Transformations',
            description: 'Translations, rotations, reflections, and dilations',
            strand: 'E',
            grades: gradeRange(3, 10),
            difficulty: {
                easy: 'Simple translations and reflections on grid',
                medium: 'Rotations and dilations with scale factors',
                hard: 'Composite transformations and congruence/similarity proofs'
            },
            parameters: { maxNumber: { default: 10 }, allowNegatives: { default: true } },
        },

        'symmetry': {
            id: 'symmetry',
            name: 'Symmetry',
            description: 'Line symmetry and rotational symmetry',
            strand: 'E',
            grades: gradeRange(2, 8),
            difficulty: {
                easy: 'Identifying line symmetry in simple shapes',
                medium: 'Drawing lines of symmetry and creating symmetric designs',
                hard: 'Rotational symmetry and symmetry in complex figures'
            },
            parameters: { maxNumber: { default: 10 } },
        },

        'congruence-similarity': {
            id: 'congruence-similarity',
            name: 'Congruence & Similarity',
            description: 'Understanding congruent and similar figures',
            strand: 'E',
            grades: gradeRange(7, 11),
            difficulty: {
                easy: 'Identifying congruent shapes',
                medium: 'Using similarity to find missing side lengths',
                hard: 'Proving triangles congruent or similar (SSS, SAS, AA)'
            },
            parameters: { maxNumber: { default: 30 }, requireIntegerAnswers: true },
        },

        'coordinate-geometry': {
            id: 'coordinate-geometry',
            name: 'Coordinate Geometry',
            description: 'Graphing and analyzing shapes on coordinate plane',
            strand: 'E',
            grades: gradeRange(6, 12),
            difficulty: {
                easy: 'Plotting points and finding distance between points',
                medium: 'Midpoint formula, slope, and equations of lines',
                hard: 'Distance formula applications and analytic geometry'
            },
            parameters: { maxNumber: { default: 15 }, allowNegatives: { default: true } },
        },

        'volume-surface': {
            id: 'volume-surface',
            name: 'Volume & Surface Area',
            description: 'Calculating volume and surface area of 3D shapes',
            strand: 'E',
            grades: gradeRange(5, 12),
            difficulty: {
                easy: 'Rectangular prisms and cubes',
                medium: 'Cylinders, cones, and spheres',
                hard: 'Composite solids and optimization'
            },
            parameters: { maxNumber: { default: 25 }, requireIntegerAnswers: true },
        },

        'word-problems': {
            id: 'word-problems',
            name: 'Geometry Word Problems',
            description: 'Real-world geometry applications',
            strand: 'E',
            grades: gradeRange(3, 12),
            difficulty: {
                easy: 'Simple area and perimeter problems',
                medium: 'Multi-step measurement problems',
                hard: 'Complex spatial reasoning problems'
            },
            parameters: { maxNumber: { default: 100 } },
        },

        'pythagorean-theorem': {
            id: 'pythagorean-theorem',
            name: 'Pythagorean Theorem',
            description: 'Finding a missing side of a right triangle',
            strand: 'E',
            grades: gradeRange(8, 12),
            difficulty: {
                easy: 'Finding the hypotenuse of a Pythagorean triple',
                medium: 'Finding either missing side',
                hard: 'Applying the theorem inside a word problem'
            },
            parameters: { maxNumber: { default: 30 }, requireIntegerAnswers: true },
        },
    }
};
