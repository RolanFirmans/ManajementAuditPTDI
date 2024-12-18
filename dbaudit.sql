PGDMP  7                
    |            audit    16.3    16.3 "    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16811    audit    DATABASE     �   CREATE DATABASE audit WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE audit;
                postgres    false                        2615    16812    audit    SCHEMA        CREATE SCHEMA audit;
    DROP SCHEMA audit;
                postgres    false            �            1259    16853    seq01maudevd    SEQUENCE     t   CREATE SEQUENCE audit.seq01maudevd
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE audit.seq01maudevd;
       audit          postgres    false    6            �            1259    16854    seq01maudusr    SEQUENCE     t   CREATE SEQUENCE audit.seq01maudusr
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE audit.seq01maudusr;
       audit          postgres    false    6            �            1259    17057    i_audevd_seq    SEQUENCE     u   CREATE SEQUENCE public.i_audevd_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.i_audevd_seq;
       public          postgres    false            �            1259    16821    tmaudevd    TABLE     @  CREATE TABLE audit.tmaudevd (
    i_audevd integer DEFAULT nextval('public.i_audevd_seq'::regclass) NOT NULL,
    n_audevd_title character varying(255) NOT NULL,
    e_audevd_phs integer NOT NULL,
    c_audevd_stat integer NOT NULL,
    d_audevd_ddl timestamp without time zone,
    e_audevd_audr character varying(255),
    c_audevd_audr integer NOT NULL,
    i_audevd_aud character varying(10),
    c_audevd_statcmp integer,
    e_audevd_note text,
    c_year character varying(4),
    i_entry numeric(2,0)[],
    d_entry time without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE audit.tmaudevd;
       audit         heap    postgres    false    225    6            �            1259    16827    tmaudevdcomnt    TABLE     	  CREATE TABLE audit.tmaudevdcomnt (
    i_audevdcomnt integer NOT NULL,
    i_audevd integer,
    i_audevdcomnt_prnt integer,
    e_audevdcomnt_contn text,
    i_audevdcomnt_aut integer,
    i_audevdcomnt_to integer,
    d_audevdcomnt_dt timestamp with time zone
);
     DROP TABLE audit.tmaudevdcomnt;
       audit         heap    postgres    false    6            �            1259    16990    tmaudevdcomnt_i_audevdcomnt_seq    SEQUENCE     �   ALTER TABLE audit.tmaudevdcomnt ALTER COLUMN i_audevdcomnt ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME audit.tmaudevdcomnt_i_audevdcomnt_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            audit          postgres    false    218    6            �            1259    17212    i_audevdfile_seq    SEQUENCE     y   CREATE SEQUENCE public.i_audevdfile_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.i_audevdfile_seq;
       public          postgres    false            �            1259    16842    tmaudevdfile    TABLE     -  CREATE TABLE audit.tmaudevdfile (
    i_audevdfile integer DEFAULT nextval('public.i_audevdfile_seq'::regclass) NOT NULL,
    n_audevdfile_file character varying(255),
    e_audevdfile_desc character varying(255),
    i_entry integer,
    d_entry timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE audit.tmaudevdfile;
       audit         heap    postgres    false    226    6            �            1259    16834    tmaudevdfiledtl    TABLE     �   CREATE TABLE audit.tmaudevdfiledtl (
    i_audevdfiledtl integer NOT NULL,
    i_audevdfile integer,
    i_audevd integer,
    i_entry integer,
    d_entry timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 "   DROP TABLE audit.tmaudevdfiledtl;
       audit         heap    postgres    false    6            �            1259    17243 #   tmaudevdfiledtl_i_audevdfiledtl_seq    SEQUENCE     �   ALTER TABLE audit.tmaudevdfiledtl ALTER COLUMN i_audevdfiledtl ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME audit.tmaudevdfiledtl_i_audevdfiledtl_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            audit          postgres    false    219    6            �            1259    16993    i_audusr_seq    SEQUENCE     u   CREATE SEQUENCE public.i_audusr_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.i_audusr_seq;
       public          postgres    false            �            1259    16813    tmaudusr    TABLE     �  CREATE TABLE audit.tmaudusr (
    i_audusr integer DEFAULT nextval('public.i_audusr_seq'::regclass) NOT NULL,
    n_audusr character varying NOT NULL,
    n_audusr_usrnm character varying(255) NOT NULL,
    n_audusr_pswd character varying(255) NOT NULL,
    c_audusr_role integer NOT NULL,
    c_audusr_audr numeric(1,0)[],
    i_entry integer,
    d_entry timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE audit.tmaudusr;
       audit         heap    postgres    false    224    6            �          0    16821    tmaudevd 
   TABLE DATA           �   COPY audit.tmaudevd (i_audevd, n_audevd_title, e_audevd_phs, c_audevd_stat, d_audevd_ddl, e_audevd_audr, c_audevd_audr, i_audevd_aud, c_audevd_statcmp, e_audevd_note, c_year, i_entry, d_entry) FROM stdin;
    audit          postgres    false    217   �(       �          0    16827    tmaudevdcomnt 
   TABLE DATA           �   COPY audit.tmaudevdcomnt (i_audevdcomnt, i_audevd, i_audevdcomnt_prnt, e_audevdcomnt_contn, i_audevdcomnt_aut, i_audevdcomnt_to, d_audevdcomnt_dt) FROM stdin;
    audit          postgres    false    218   @)       �          0    16842    tmaudevdfile 
   TABLE DATA           k   COPY audit.tmaudevdfile (i_audevdfile, n_audevdfile_file, e_audevdfile_desc, i_entry, d_entry) FROM stdin;
    audit          postgres    false    220   ])       �          0    16834    tmaudevdfiledtl 
   TABLE DATA           c   COPY audit.tmaudevdfiledtl (i_audevdfiledtl, i_audevdfile, i_audevd, i_entry, d_entry) FROM stdin;
    audit          postgres    false    219   �)       �          0    16813    tmaudusr 
   TABLE DATA           �   COPY audit.tmaudusr (i_audusr, n_audusr, n_audusr_usrnm, n_audusr_pswd, c_audusr_role, c_audusr_audr, i_entry, d_entry) FROM stdin;
    audit          postgres    false    216   >*       �           0    0    seq01maudevd    SEQUENCE SET     :   SELECT pg_catalog.setval('audit.seq01maudevd', 1, false);
          audit          postgres    false    221            �           0    0    seq01maudusr    SEQUENCE SET     9   SELECT pg_catalog.setval('audit.seq01maudusr', 3, true);
          audit          postgres    false    222            �           0    0    tmaudevdcomnt_i_audevdcomnt_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('audit.tmaudevdcomnt_i_audevdcomnt_seq', 1, false);
          audit          postgres    false    223            �           0    0 #   tmaudevdfiledtl_i_audevdfiledtl_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('audit.tmaudevdfiledtl_i_audevdfiledtl_seq', 6, true);
          audit          postgres    false    227            �           0    0    i_audevd_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.i_audevd_seq', 1, false);
          public          postgres    false    225            �           0    0    i_audevdfile_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.i_audevdfile_seq', 2, true);
          public          postgres    false    226            �           0    0    i_audusr_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.i_audusr_seq', 3, true);
          public          postgres    false    224            ;           2606    16951    tmaudevd tmaudevd_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY audit.tmaudevd
    ADD CONSTRAINT tmaudevd_pkey PRIMARY KEY (i_audevd);
 ?   ALTER TABLE ONLY audit.tmaudevd DROP CONSTRAINT tmaudevd_pkey;
       audit            postgres    false    217            =           2606    16918     tmaudevdcomnt tmaudevdcomnt_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY audit.tmaudevdcomnt
    ADD CONSTRAINT tmaudevdcomnt_pkey PRIMARY KEY (i_audevdcomnt);
 I   ALTER TABLE ONLY audit.tmaudevdcomnt DROP CONSTRAINT tmaudevdcomnt_pkey;
       audit            postgres    false    218            A           2606    16904    tmaudevdfile tmaudevdfile_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY audit.tmaudevdfile
    ADD CONSTRAINT tmaudevdfile_pkey PRIMARY KEY (i_audevdfile);
 G   ALTER TABLE ONLY audit.tmaudevdfile DROP CONSTRAINT tmaudevdfile_pkey;
       audit            postgres    false    220            ?           2606    16879 $   tmaudevdfiledtl tmaudevdfiledtl_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY audit.tmaudevdfiledtl
    ADD CONSTRAINT tmaudevdfiledtl_pkey PRIMARY KEY (i_audevdfiledtl);
 M   ALTER TABLE ONLY audit.tmaudevdfiledtl DROP CONSTRAINT tmaudevdfiledtl_pkey;
       audit            postgres    false    219            9           2606    16858    tmaudusr tmaudusr_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY audit.tmaudusr
    ADD CONSTRAINT tmaudusr_pkey PRIMARY KEY (i_audusr);
 ?   ALTER TABLE ONLY audit.tmaudusr DROP CONSTRAINT tmaudusr_pkey;
       audit            postgres    false    216            �   K   x�3��M�KLO�M�+�4�4�4202�5��54Q00�#d%&���@�1~ ��������L�������+F��� ��d      �      x������ � �      �   |   x��̱�0 й���M���h[o���,�	!jY�|����M�a S�pr���/��s�0�)U��~�}-e}�fΆ��9`��	{��6���HA��m+�R~� kϭ�"\��[k���-&      �   E   x�]ʱ� �ڞ�>��?���?G�6ҕ7rO�w���_�Ncb�g���ߢ!�qYp���5U� �:�      �     x�m�1s�0��9|
��i�$��a� PE��\��h��Q��鋃�w��_~� �����:ʚ�e� ��MH���HUE�9I�nܺ�'�MR���I\��_�Fy��iY.2�@���(���ޡ�n�6X[_��Q4r�R2��B{&�'ni��,o_%��������o/w!'���œ~$Xd�ۦ�~�(�?����|�s��R�]O�4`F]��M��;;;?��$��e��#��J�s��I�C}(u"��}
2b���S2���k���>^F     