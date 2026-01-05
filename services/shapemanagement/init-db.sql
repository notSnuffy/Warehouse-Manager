CREATE SEQUENCE IF NOT EXISTS shapes_id_seq START 5;

-- SEQUENCE: public.shape_instance_seq

-- DROP SEQUENCE IF EXISTS public.shape_instance_seq;

CREATE SEQUENCE IF NOT EXISTS public.shape_instance_seq
    INCREMENT 1
    START 5
    MINVALUE 5
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.shape_instance_seq
    OWNER TO postgres;


-- Table: public.shape

-- DROP TABLE IF EXISTS public.shape;

CREATE TABLE IF NOT EXISTS public.shape
(
    id bigint NOT NULL,
    version timestamp(6) with time zone NOT NULL,
    current boolean NOT NULL,
    deleted boolean NOT NULL,
    is_public boolean NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT shape_pkey PRIMARY KEY (id, version),
    CONSTRAINT shape_type_check CHECK (type::text = ANY (ARRAY['ELLIPSE'::character varying, 'ARC'::character varying, 'POLYGON'::character varying, 'RECTANGLE'::character varying, 'CONTAINER'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.shape
    OWNER to postgres;

-- Table: public.shape_instance

-- DROP TABLE IF EXISTS public.shape_instance;

CREATE TABLE IF NOT EXISTS public.shape_instance
(
    id bigint NOT NULL,
    instructions jsonb,
    is_template boolean NOT NULL,
    shape_id bigint NOT NULL,
    shape_version timestamp(6) with time zone NOT NULL,
    CONSTRAINT shape_instance_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.shape_instance
    OWNER to postgres;

------------------------------ RECTANGLE --------------------------------

INSERT INTO public.shape (
    id,
    version,
    current,
    deleted,
    is_public,
    name,
    type
) 
SELECT
    1, 
    CURRENT_TIMESTAMP, 
    true, 
    false, 
    false, 
    'Rectangle', 
    'RECTANGLE'
WHERE NOT EXISTS (
    SELECT 1
    FROM public.shape
    WHERE id = 1
); 


INSERT INTO public.shape_instance (
    id,
    instructions,
    is_template,
    shape_id,
    shape_version
)
SELECT
    1,
    '[
         {
           "command": "CREATE_RECTANGLE",
           "parameters": {
             "width": 100,
             "height": 100,
             "shapeId": null,
             "rotation": 0,
             "arcRadius": null,
             "positionX": 0,
             "positionY": 0,
             "arcEndAngle": null,
             "shapeVersion": null,
             "arcStartAngle": null,
             "polygonPoints": null
           }
         }
    ]'::jsonb,
    true,
    1,
    (
        SELECT version
        FROM public.shape
        WHERE id = 1
    )
WHERE NOT EXISTS (
    SELECT 1
    FROM public.shape_instance
    WHERE id = 1
);

-------------------------------- ELLIPSE --------------------------------

INSERT INTO public.shape (
    id,
    version,
    current,
    deleted,
    is_public,
    name,
    type
) 
SELECT
    2, 
    CURRENT_TIMESTAMP, 
    true, 
    false, 
    false, 
    'Ellipse', 
    'ELLIPSE'
WHERE NOT EXISTS (
    SELECT 1
    FROM public.shape
    WHERE id = 2
);

INSERT INTO public.shape_instance (
    id,
    instructions,
    is_template,
    shape_id,
    shape_version
)
SELECT
    2,
    '[
         {
           "command": "CREATE_ELLIPSE",
           "parameters": {
             "width": 100,
             "height": 100,
             "shapeId": null,
             "rotation": 0,
             "arcRadius": null,
             "positionX": 0,
             "positionY": 0,
             "arcEndAngle": null,
             "shapeVersion": null,
             "arcStartAngle": null,
             "polygonPoints": null
           }
         }
    ]'::jsonb,
    true,
    2,
    (
        SELECT version
        FROM public.shape
        WHERE id = 2
    )
WHERE NOT EXISTS (
    SELECT 1
    FROM public.shape_instance
    WHERE id = 2
);

-------------------------------- ARC --------------------------------

INSERT INTO public.shape (
    id,
    version,
    current,
    deleted,
    is_public,
    name,
    type
) 
SELECT
    3, 
    CURRENT_TIMESTAMP, 
    true, 
    false, 
    false, 
    'Arc', 
    'ARC'
WHERE NOT EXISTS (
    SELECT 1
    FROM public.shape
    WHERE id = 3
);

INSERT INTO public.shape_instance (
    id,
    instructions,
    is_template,
    shape_id,
    shape_version
)
SELECT
    3,
    '[
         {
           "command": "CREATE_ARC",
           "parameters": {
             "width": 100,
             "height": 100,
             "shapeId": null,
             "rotation": 0,
             "arcRadius": 50,
             "positionX": 0,
             "positionY": 0,
             "arcEndAngle": 180,
             "shapeVersion": null,
             "arcStartAngle": 0,
             "polygonPoints": null
           }
         }
    ]'::jsonb,
    true,
    3,
    (
        SELECT version
        FROM public.shape
        WHERE id = 3
    )
WHERE NOT EXISTS (
    SELECT 1
    FROM public.shape_instance
    WHERE id = 3
);

-------------------------------- POLYGON --------------------------------

INSERT INTO public.shape (
    id,
    version,
    current,
    deleted,
    is_public,
    name,
    type
) 
SELECT
    4, 
    CURRENT_TIMESTAMP, 
    true, 
    false, 
    false, 
    'Polygon', 
    'POLYGON'
WHERE NOT EXISTS (
    SELECT 1
    FROM public.shape
    WHERE id = 4
);

INSERT INTO public.shape_instance (
    id,
    instructions,
    is_template,
    shape_id,
    shape_version
)
SELECT
    4,
    '[
         {
           "command": "CREATE_POLYGON",
           "parameters": {
             "width": 50,
             "height": 50,
             "shapeId": null,
             "rotation": 0,
             "arcRadius": null,
             "positionX": 0,
             "positionY": 0,
             "arcEndAngle": null,
             "shapeVersion": null,
             "arcStartAngle": null,
             "polygonPoints": [
               0,
               0,
               50,
               0,
               50,
               50,
               0,
               0
             ]
           }
         }
    ]'::jsonb,
    true,
    4,
    (
        SELECT version
        FROM public.shape
        WHERE id = 4
    )
WHERE NOT EXISTS (
    SELECT 1
    FROM public.shape_instance
    WHERE id = 4
);
