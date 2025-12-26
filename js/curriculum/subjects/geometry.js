/**
 * Geometry Subject Configuration
 * Shapes, measurements, spatial reasoning, and proofs
 */

export const geometry = {
    id: 'geometry',
    name: 'Geometry',
    description: 'Shapes, measurements, and spatial relationships',
    icon: 'shapes',

    // Topics organized by concept
    topics: {
        '2d-shapes': {
            id: '2d-shapes',
            name: '2D Shapes Recognition',
            description: 'Identifying and classifying basic 2D shapes',
            grades: ['elementary'],
            difficulty: {
                easy: 'Identifying circles, squares, triangles, rectangles',
                medium: 'Classifying shapes by attributes (sides, vertices)',
                hard: 'Complex shape patterns and classification'
            }
        },

        '3d-shapes': {
            id: '3d-shapes',
            name: '3D Shapes & Solids',
            description: 'Identifying 3D shapes, faces, edges, vertices',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Identifying cubes, spheres, cones, cylinders',
                medium: 'Counting faces, edges, and vertices',
                hard: 'Nets of 3D shapes and spatial visualization'
            }
        },

        'area-perimeter': {
            id: 'area-perimeter',
            name: 'Area & Perimeter',
            description: 'Calculating area and perimeter of 2D shapes',
            grades: ['elementary', 'middle', 'high'],
            difficulty: {
                easy: 'Rectangles and squares',
                medium: 'Triangles and circles',
                hard: 'Composite shapes and irregular polygons'
            }
        },

        'angles': {
            id: 'angles',
            name: 'Angles & Lines',
            description: 'Measuring and classifying angles',
            grades: ['elementary', 'middle', 'high'],
            difficulty: {
                easy: 'Identifying acute, right, obtuse angles',
                medium: 'Complementary and supplementary angles',
                hard: 'Angle relationships with parallel lines and transversals'
            }
        },

        'triangles': {
            id: 'triangles',
            name: 'Triangles',
            description: 'Triangle properties, types, and theorems',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Classifying triangles by sides and angles',
                medium: 'Pythagorean theorem',
                hard: 'Triangle congruence and similarity proofs'
            }
        },

        'circles': {
            id: 'circles',
            name: 'Circles',
            description: 'Circle properties, circumference, and area',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Finding circumference and area',
                medium: 'Arc length and sector area',
                hard: 'Circle theorems and tangent problems'
            }
        },

        'polygons': {
            id: 'polygons',
            name: 'Polygons',
            description: 'Properties of polygons',
            grades: ['elementary', 'middle', 'high'],
            difficulty: {
                easy: 'Identifying and naming polygons',
                medium: 'Interior and exterior angles',
                hard: 'Regular polygons and tessellations'
            }
        },

        'transformations': {
            id: 'transformations',
            name: 'Transformations',
            description: 'Translations, rotations, reflections, and dilations',
            grades: ['middle', 'high'],
            difficulty: {
                easy: 'Simple translations and reflections on grid',
                medium: 'Rotations and dilations with scale factors',
                hard: 'Composite transformations and congruence/similarity proofs'
            }
        },

        'symmetry': {
            id: 'symmetry',
            name: 'Symmetry',
            description: 'Line symmetry and rotational symmetry',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Identifying line symmetry in simple shapes',
                medium: 'Drawing lines of symmetry and creating symmetric designs',
                hard: 'Rotational symmetry and symmetry in complex figures'
            }
        },

        'congruence-similarity': {
            id: 'congruence-similarity',
            name: 'Congruence & Similarity',
            description: 'Understanding congruent and similar figures',
            grades: ['middle', 'high'],
            difficulty: {
                easy: 'Identifying congruent shapes',
                medium: 'Using similarity to find missing side lengths',
                hard: 'Proving triangles congruent or similar (SSS, SAS, AA)'
            }
        },

        'coordinate-geometry': {
            id: 'coordinate-geometry',
            name: 'Coordinate Geometry',
            description: 'Graphing and analyzing shapes on coordinate plane',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Plotting points and finding distance between points',
                medium: 'Midpoint formula, slope, and equations of lines',
                hard: 'Distance formula applications and analytic geometry'
            }
        },

        'volume-surface': {
            id: 'volume-surface',
            name: 'Volume & Surface Area',
            description: 'Calculating volume and surface area of 3D shapes',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Rectangular prisms and cubes',
                medium: 'Cylinders, cones, and spheres',
                hard: 'Composite solids and optimization'
            }
        },

        'word-problems': {
            id: 'word-problems',
            name: 'Geometry Word Problems',
            description: 'Real-world geometry applications',
            grades: ['elementary', 'middle', 'high', 'college'],
            difficulty: {
                easy: 'Simple area and perimeter problems',
                medium: 'Multi-step measurement problems',
                hard: 'Complex spatial reasoning problems'
            }
        }
    }
};
