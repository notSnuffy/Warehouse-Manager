CREATE SEQUENCE IF NOT EXISTS floor_id_seq START 1;

-- SEQUENCE: public.corner_seq

-- DROP SEQUENCE IF EXISTS public.corner_seq;

CREATE SEQUENCE IF NOT EXISTS public.corner_seq
    INCREMENT 50
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.corner_seq
    OWNER TO postgres;

-- SEQUENCE: public.wall_seq

-- DROP SEQUENCE IF EXISTS public.wall_seq;

CREATE SEQUENCE IF NOT EXISTS public.wall_seq
    INCREMENT 50
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.wall_seq
    OWNER TO postgres;


-- Table: public.floor

-- DROP TABLE IF EXISTS public.floor;

CREATE TABLE IF NOT EXISTS public.floor
(
    id bigint NOT NULL,
    version timestamp(6) with time zone NOT NULL,
    current boolean NOT NULL,
    deleted boolean NOT NULL,
    furniture_ids bigint[],
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT floor_pkey PRIMARY KEY (id, version)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.floor
    OWNER to postgres;

-- Table: public.corner

-- DROP TABLE IF EXISTS public.corner;

CREATE TABLE IF NOT EXISTS public.corner
(
    id bigint NOT NULL,
    positionx real NOT NULL,
    positiony real NOT NULL,
    floor_id bigint NOT NULL,
    floor_version timestamp(6) with time zone NOT NULL,
    CONSTRAINT corner_pkey PRIMARY KEY (id),
    CONSTRAINT fkk2p3k5vcvdb37y2agmpqto2mc FOREIGN KEY (floor_id, floor_version)
        REFERENCES public.floor (id, version) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.corner
    OWNER to postgres;

-- Table: public.wall

-- DROP TABLE IF EXISTS public.wall;

CREATE TABLE IF NOT EXISTS public.wall
(
    id bigint NOT NULL,
    end_corner_id bigint NOT NULL,
    floor_id bigint NOT NULL,
    floor_version timestamp(6) with time zone NOT NULL,
    start_corner_id bigint NOT NULL,
    CONSTRAINT wall_pkey PRIMARY KEY (id),
    CONSTRAINT fkgjyh908kq01vt76bog9br0f2b FOREIGN KEY (end_corner_id)
        REFERENCES public.corner (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fkibc6fil6ckoj0rl7xtsiemqio FOREIGN KEY (floor_id, floor_version)
        REFERENCES public.floor (id, version) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fkmqqpxr78b7l0781au3xor6y9o FOREIGN KEY (start_corner_id)
        REFERENCES public.corner (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.wall
    OWNER to postgres;
