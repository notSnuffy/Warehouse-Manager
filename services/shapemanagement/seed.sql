-- Create 'properties' table to store shape properties
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    rotation INTEGER NOT NULL,
    arcAngle INTEGER,
    radius INTEGER
);

-- Create shapes table
CREATE TABLE IF NOT EXISTS shapes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('rectangle', 'ellipse', 'polygon', 'arc', 'container')) NOT NULL,
  public BOOLEAN NOT NULL,
  properties_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE
);

-- Create 'shape_components' table for composition
CREATE TABLE IF NOT EXISTS shape_components (
  id SERIAL PRIMARY KEY,
  container_id INTEGER NOT NULL REFERENCES shapes(id) ON DELETE CASCADE,
  component_id INTEGER NOT NULL REFERENCES shapes(id) ON DELETE CASCADE,
  properties_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE
);


-- Create 'PolygonPoints' table to store polygon points
CREATE TABLE IF NOT EXISTS polygon_points (
  id SERIAL PRIMARY KEY,
  properties_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL
);

INSERT INTO properties (id, x, y, width, height, rotation) VALUES
    (1, 0, 0, 100, 50, 0),
    (2, 100, 150, 200, 100, 0),
    (3, 300, 350, 150, 75, 1),
    (4, 400, 450, 200, 100, 0);

INSERT INTO shapes (id, name, type, public, properties_id) VALUES
(1, 'Rectangle', 'rectangle', true, 1),
(2, 'Composite Shape', 'container', false, 2);

INSERT INTO shape_components (container_id, component_id, properties_id) VALUES
(1, 2, 3),
(2, 1, 4);

