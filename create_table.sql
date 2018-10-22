create table accounts
(
	id bigint auto_increment
		primary key,
	username varchar(256) not null,
	password varchar(256) null,
	confirmed tinyint(1) default '0' not null,
	confirmed_on timestamp default CURRENT_TIMESTAMP not null,
	create_time timestamp default CURRENT_TIMESTAMP not null,
	update_time timestamp default CURRENT_TIMESTAMP not null,
	constraint accounts_username_uindex
		unique (username)
)
;

create table categories
(
	id bigint null,
	name varchar(50) not null,
	create_time timestamp default CURRENT_TIMESTAMP not null,
	update_time timestamp default CURRENT_TIMESTAMP not null
)
;

create table images
(
	id int auto_increment
		primary key,
	name varchar(256) not null,
	url text not null comment '原图url',
	icon_url text not null,
	create_time timestamp default CURRENT_TIMESTAMP not null,
	update_time timestamp default CURRENT_TIMESTAMP not null,
	thumb_url text not null comment '压缩缩略图url 5-10k'
)
;

create table posts
(
	id bigint auto_increment
		primary key,
	title varchar(256) not null,
	category_id bigint not null,
	is_ad tinyint(1) default '0' not null,
	likes bigint default '0' not null,
	pv bigint default '0' null,
	image_header_id bigint null,
	content text not null,
	author varchar(50) not null,
	region varchar(50) null,
	update_time timestamp default CURRENT_TIMESTAMP not null,
	create_time timestamp default CURRENT_TIMESTAMP not null,
	tag_ids varchar(256) null
)
;

create table tags
(
	id bigint auto_increment
		primary key,
	name varchar(50) not null,
	create_time datetime default CURRENT_TIMESTAMP not null,
	update_time datetime default CURRENT_TIMESTAMP not null
)
;

