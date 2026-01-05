CREATE SEQUENCE IF NOT EXISTS items_id_seq START 1;

-- Table: public.item

-- DROP TABLE IF EXISTS public.item;

CREATE TABLE IF NOT EXISTS public.item
(
    id bigint NOT NULL,
    version timestamp(6) with time zone NOT NULL,
    category character varying(255) COLLATE pg_catalog."default",
    current boolean NOT NULL,
    deleted boolean NOT NULL,
    description character varying(255) COLLATE pg_catalog."default",
    floor_id bigint,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    parent_id bigint,
    quantity character varying(255) COLLATE pg_catalog."default",
    zone_id bigint,
    CONSTRAINT item_pkey PRIMARY KEY (id, version)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.item
    OWNER to postgres;
