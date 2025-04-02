create database bd_inventario;
use  bd_inventario;

create table usuarios (idusuario int(6) primary key auto_increment, nombre varchar(100), correo varchar(50), contrasena varchar(25), idrol int(2), estatus int(1));

create table productos (idproducto int(6) primary key auto_increment, nombre varchar(40), descripcion varchar(100), precio decimal(6,2), cantidad int(4), activo boolean);

create table historial (idhistorial int(6) primary key auto_increment, tipo varchar(20), cantidad int(4), fecha datetime, idproducto int(6), idusuario int(6));

create table roles (idrol int(6) primary key auto_increment, nombre varchar(20));

alter table historial add foreign key (idProducto) references productos (idProducto) ON DELETE CASCADE on update cascade;

alter table historial add foreign key (idusuario) references usuarios (idusuario) ON DELETE CASCADE on update cascade;

alter table usuarios add foreign key (idrol) references roles(idrol) ON delete CASCADE ON UPDATE CASCADE;