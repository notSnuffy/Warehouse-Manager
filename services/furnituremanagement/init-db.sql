CREATE SEQUENCE IF NOT EXISTS furniture_id_seq START 1;

-- SEQUENCE: public.furniture_instance_history_seq

-- DROP SEQUENCE IF EXISTS public.furniture_instance_history_seq;

CREATE SEQUENCE IF NOT EXISTS public.furniture_instance_history_seq
    INCREMENT 50
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.furniture_instance_history_seq
    OWNER TO postgres;

-- SEQUENCE: public.furniture_instance_seq

-- DROP SEQUENCE IF EXISTS public.furniture_instance_seq;

CREATE SEQUENCE IF NOT EXISTS public.furniture_instance_seq
    INCREMENT 50
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.furniture_instance_seq
    OWNER TO postgres;

-- SEQUENCE: public.zone_instance_seq

-- DROP SEQUENCE IF EXISTS public.zone_instance_seq;

CREATE SEQUENCE IF NOT EXISTS public.zone_instance_seq
    INCREMENT 50
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.zone_instance_seq
    OWNER TO postgres;

-- SEQUENCE: public.zone_seq

-- DROP SEQUENCE IF EXISTS public.zone_seq;

CREATE SEQUENCE IF NOT EXISTS public.zone_seq
    INCREMENT 50
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.zone_seq
    OWNER TO postgres;

-- Table: public.furniture

-- DROP TABLE IF EXISTS public.furniture;

CREATE TABLE IF NOT EXISTS public.furniture
(
    id bigint NOT NULL,
    version timestamp(6) with time zone NOT NULL,
    current boolean NOT NULL,
    deleted boolean NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    shape_ids bigint[],
    top_down_view_id bigint NOT NULL,
    CONSTRAINT furniture_pkey PRIMARY KEY (id, version)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.furniture
    OWNER to postgres;

-- Table: public.furniture_instance

-- DROP TABLE IF EXISTS public.furniture_instance;

CREATE TABLE IF NOT EXISTS public.furniture_instance
(
    id bigint NOT NULL,
    top_down_view_instance_id bigint NOT NULL,
    version timestamp(6) with time zone NOT NULL,
    furniture_id bigint NOT NULL,
    furniture_version timestamp(6) with time zone NOT NULL,
    CONSTRAINT furniture_instance_pkey PRIMARY KEY (id),
    CONSTRAINT fkj060eswyywn9lgnifub04cnjp FOREIGN KEY (furniture_id, furniture_version)
        REFERENCES public.furniture (id, version) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.furniture_instance
    OWNER to postgres;

-- Table: public.furniture_instance_history

-- DROP TABLE IF EXISTS public.furniture_instance_history;

CREATE TABLE IF NOT EXISTS public.furniture_instance_history
(
    id bigint NOT NULL,
    furniture_instance_id bigint NOT NULL,
    furniture_instance_version timestamp(6) with time zone NOT NULL,
    top_down_view_instance_id bigint NOT NULL,
    CONSTRAINT furniture_instance_history_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.furniture_instance_history
    OWNER to postgres;

-- Table: public.zone

-- DROP TABLE IF EXISTS public.zone;

CREATE TABLE IF NOT EXISTS public.zone
(
    id bigint NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    shape_id bigint NOT NULL,
    furniture_id bigint,
    furniture_version timestamp(6) with time zone,
    CONSTRAINT zone_pkey PRIMARY KEY (id),
    CONSTRAINT fkinaif372j4w530vrn47brurn0 FOREIGN KEY (furniture_id, furniture_version)
        REFERENCES public.furniture (id, version) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.zone
    OWNER to postgres;

-- Table: public.zone_instance

-- DROP TABLE IF EXISTS public.zone_instance;

CREATE TABLE IF NOT EXISTS public.zone_instance
(
    id bigint NOT NULL,
    furniture_instance_id bigint NOT NULL,
    zone_id bigint NOT NULL,
    CONSTRAINT zone_instance_pkey PRIMARY KEY (id),
    CONSTRAINT fk7wioegi6bv5acyie11o22cpag FOREIGN KEY (zone_id)
        REFERENCES public.zone (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fknkoi7wq0aa8ghtsupw309mf8p FOREIGN KEY (furniture_instance_id)
        REFERENCES public.furniture_instance (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.zone_instance
    OWNER to postgres;

-- Table: public.zone_instance_items

-- DROP TABLE IF EXISTS public.zone_instance_items;

CREATE TABLE IF NOT EXISTS public.zone_instance_items
(
    zone_instance_id bigint NOT NULL,
    item_id bigint,
    CONSTRAINT fkn9dif2dcxoqhhavcujla6lqqe FOREIGN KEY (zone_instance_id)
        REFERENCES public.zone_instance (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.zone_instance_items
    OWNER to postgres;
