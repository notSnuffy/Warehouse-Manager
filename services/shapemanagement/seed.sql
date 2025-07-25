-- Create shapes table
CREATE TABLE IF NOT EXISTS shapes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('rectangle', 'ellipse', 'polygon', 'arc', 'container')) NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  public BOOLEAN NOT NULL
);

-- Create 'shape_components' table for composition
CREATE TABLE IF NOT EXISTS shape_components (
  id SERIAL PRIMARY KEY,
  container_id INTEGER NOT NULL REFERENCES shapes(id) ON DELETE CASCADE,
  component_id INTEGER NOT NULL REFERENCES shapes(id) ON DELETE CASCADE,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb
);

INSERT INTO shapes (id, name, type, properties, public) VALUES
(1, 'Rectangle', 'rectangle', '{"x": 100, "y": 150, "width": 100, "height": 50, "rotation": 0}', false),
(2, 'Composite Rectangle', 'container', '{"x": 300, "y": 350, "width": 200, "height": 100, "rotation": 0}', false);

INSERT INTO shape_components (container_id, component_id, properties) VALUES
(2, 1, '{"x": 0, "y": 0, "width": 100, "height": 50, "rotation": 0}'),
(2, 1, '{"x": 100, "y": 0, "width": 150, "height": 75, "rotation": 1}');
