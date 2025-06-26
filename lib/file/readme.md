Aca se manejara la lectura de archivos y escritura versionada de archivos .tin
el archivo tendra esta estructura:

```json
{
  "version": "1.0",
  "metadata": {
    "author": "Nombre del autor",
    "date": "Fecha de creacion",
    "description": "Descripcion del archivo"
  },
  "data": {}
}
```

El campo `data` es un objeto que puede contener cualquier tipo de datos.
por cada rango de versiones debe aver un lector de archivos para mantener la compatibilidad
con versiones anteriores.

para la escritura sera en formato binario hexadcimal con compresion zlib
y se guardara en un archivo con extension `.tin`.
la imagen o icono del archivo sera el icono de la aplicacion
public/tinti-logo.png

tambien agrega nuevas rutas al manifiest.json 
una de Abrir imagen y otra de Abrir archivo .tin

eso incluye que en la mainpage agregues la opcion de importar un archivo .tin
o importar una imagen
y que al importar un archivo .tin se cree un nuevo proyecto
y al importar una imagen se cree un nuevo proyecto con la imagen como contenido